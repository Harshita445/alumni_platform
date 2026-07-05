from datetime import date, time, timedelta
from decimal import Decimal
import os
import sys

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.database import SessionLocal
from app.main import app
from app.models.booking import Booking, BookingStatus
from app.models.mentorship_service import MentorshipService
from app.models.payments import MentorPayoutSettings, Payment
from app.models.user import User

client = TestClient(app)


def test_payment_flow_moves_booking_to_paid_and_updates_booking_status():
    db = SessionLocal()
    try:
        student_email = "student-payment-flow@example.com"
        alumni_email = "alumni-payment-flow@example.com"

        db.query(Payment).delete()
        db.query(Booking).delete()
        db.query(MentorPayoutSettings).delete()
        db.query(MentorshipService).delete()
        db.query(User).filter(User.email.in_([student_email, alumni_email])).delete()
        db.commit()

        student = User(
            email=student_email,
            hashed_password=hash_password("Password123!"),
            role="student",
            auth_provider="email",
            is_verified=True,
        )
        alumni = User(
            email=alumni_email,
            hashed_password=hash_password("Password123!"),
            role="alumni",
            auth_provider="email",
            is_verified=True,
        )
        db.add_all([student, alumni])
        db.commit()
        db.refresh(student)
        db.refresh(alumni)

        payout_settings = MentorPayoutSettings(
            mentor_id=alumni.id,
            method="UPI",
            upi_id="mentor@upi",
            verified="verified",
        )
        db.add(payout_settings)
        db.commit()

        mentorship_service = MentorshipService(
            alumni_id=alumni.id,
            service_type="Resume Review",
            price=Decimal("399"),
            is_enabled=True,
            currency="INR",
        )
        db.add(mentorship_service)
        db.commit()

        booking = Booking(
            student_id=student.id,
            alumni_id=alumni.id,
            session_type="Resume Review",
            date=date.today() + timedelta(days=2),
            time=time(hour=10, minute=0),
            status=BookingStatus.APPROVED.value,
            status_history=[
                {
                    "status": BookingStatus.PENDING.value,
                    "changed_at": (date.today() - timedelta(days=1)).isoformat(),
                    "note": "Request submitted",
                },
                {
                    "status": BookingStatus.APPROVED.value,
                    "changed_at": date.today().isoformat(),
                    "note": "Mentor approved request",
                },
            ],
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        login_response = client.post(
            "/auth/login",
            data={"username": student.email, "password": "Password123!"},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        payment_response = client.post(
            "/payments",
            json={"booking_id": booking.id},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert payment_response.status_code == 200
        payment_body = payment_response.json()
        assert payment_body["status"] == "PAYMENT_PENDING"
        assert payment_body["gross_amount"] in {"399", "399.00"}
        assert "booking_id" in payment_body
        assert payment_body["booking_id"] == booking.id

        mark_paid_response = client.post(
            f"/payments/{payment_body['id']}/mark-paid",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert mark_paid_response.status_code == 200
        assert mark_paid_response.json()["status"] == "PAID"

        db.refresh(booking)
        assert booking.status == BookingStatus.PAID.value
    finally:
        db.query(Payment).delete()
        db.query(Booking).delete()
        db.query(MentorPayoutSettings).delete()
        db.query(MentorshipService).delete()
        db.query(User).filter(User.email.in_([student_email, alumni_email])).delete()
        db.commit()
        db.close()


def test_alumni_can_confirm_paid_booking_and_meeting_link_is_generated():
    db = SessionLocal()
    try:
        student_email = "student-confirm-flow@example.com"
        alumni_email = "alumni-confirm-flow@example.com"

        db.query(Booking).delete()
        db.query(User).filter(User.email.in_([student_email, alumni_email])).delete()
        db.commit()

        student = User(
            email=student_email,
            hashed_password=hash_password("Password123!"),
            role="student",
            auth_provider="email",
            is_verified=True,
        )
        alumni = User(
            email=alumni_email,
            hashed_password=hash_password("Password123!"),
            role="alumni",
            auth_provider="email",
            is_verified=True,
        )
        db.add_all([student, alumni])
        db.commit()
        db.refresh(student)
        db.refresh(alumni)

        booking = Booking(
            student_id=student.id,
            alumni_id=alumni.id,
            session_type="Mock Interview",
            date=date.today() + timedelta(days=3),
            time=time(hour=14, minute=30),
            status=BookingStatus.PAID.value,
            status_history=[
                {
                    "status": BookingStatus.PENDING.value,
                    "changed_at": (date.today() - timedelta(days=2)).isoformat(),
                    "note": "Request submitted",
                },
                {
                    "status": BookingStatus.APPROVED.value,
                    "changed_at": (date.today() - timedelta(days=1)).isoformat(),
                    "note": "Mentor approved request",
                },
                {
                    "status": BookingStatus.AWAITING_PAYMENT.value,
                    "changed_at": date.today().isoformat(),
                    "note": "Awaiting student payment",
                },
                {
                    "status": BookingStatus.PAID.value,
                    "changed_at": date.today().isoformat(),
                    "note": "Payment completed",
                },
            ],
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        login_response = client.post(
            "/auth/login",
            data={"username": alumni.email, "password": "Password123!"},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        confirm_response = client.patch(
            f"/bookings/{booking.id}",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert confirm_response.status_code == 200
        body = confirm_response.json()
        assert body["status"] == "confirmed"
        assert body["meeting_link"] is not None
        assert "https://meet.google.com/" in body["meeting_link"]
    finally:
        db.query(Booking).delete()
        db.query(User).filter(User.email.in_([student_email, alumni_email])).delete()
        db.commit()
        db.close()
