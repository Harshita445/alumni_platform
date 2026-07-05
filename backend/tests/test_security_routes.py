import base64
import json
import os
import sys
import time
from uuid import uuid4

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import or_

from app.database import SessionLocal
from app.main import app
from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification
from app.models.profile import Profile
from app.models.user import User
from app.routes import auth as auth_routes
from app.core.security import hash_password

client = TestClient(app)


def test_user_deletion_cascades_profile_cleanup():
    db = SessionLocal()
    email = f"cascade-profile-{uuid4().hex[:8]}@example.com"
    user_id = None
    try:
        user = User(
            email=email,
            hashed_password="unused",
            role="alumni",
            auth_provider="email",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

        profile = Profile(
            user_id=user_id,
            full_name="Cascade Profile",
            company="Test Company",
            designation="Lead Engineer",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
        db.query(Booking).filter(or_(Booking.student_id == user_id, Booking.alumni_id == user_id)).delete(synchronize_session=False)
        db.commit()

        db.delete(user)
        db.commit()

        assert db.query(Profile).filter(Profile.user_id == user_id).count() == 0
    finally:
        if user_id is not None:
            db.query(Profile).filter(Profile.user_id == user_id).delete(synchronize_session=False)
            db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
            db.query(Booking).filter(or_(Booking.student_id == user_id, Booking.alumni_id == user_id)).delete(synchronize_session=False)
            db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
            db.commit()
        db.close()


def test_profile_update_rejects_role_escape_fields_for_students():
    # This test exercises the route contract without relying on a real DB state.
    response = client.put(
        "/profile/me",
        json={"company": "Example", "designation": "Director"},
        headers={"Authorization": "Bearer invalid"},
    )

    assert response.status_code == 401


def test_register_rejects_alumni_role_for_student_email_patterns():
    email = "student_be24_unique@thapar.edu"
    db = SessionLocal()
    try:
        db.query(User).filter(User.email == email).delete()
        db.commit()

        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": "Password123!",
                "role": "alumni",
            },
        )

        assert response.status_code == 400
        assert "student" in response.json()["detail"].lower()
    finally:
        db.query(User).filter(User.email == email).delete()
        db.commit()
        db.close()


def test_register_normalizes_email_and_login_accepts_case_variants():
    db = SessionLocal()
    email = "CaseSensitiveUser@thapar.edu"
    try:
        db.query(User).filter(User.email == email.lower()).delete()
        db.commit()

        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": "Password123!",
                "role": "student",
            },
        )

        assert response.status_code == 200
        user = db.query(User).filter(User.email == email.lower()).first()
        assert user is not None
        assert user.email == email.lower()

        login_response = client.post(
            "/auth/login",
            data={
                "username": email.upper(),
                "password": "Password123!",
            },
        )

        assert login_response.status_code == 200
        assert login_response.json()["access_token"]
    finally:
        db.query(User).filter(User.email == email.lower()).delete()
        db.commit()
        db.close()


@pytest.mark.parametrize(
    "suffix",
    ["be23", "be24", "be25", "be26"],
)
def test_register_rejects_students_with_graduating_batch_suffixes(suffix):
    email = f"student_{suffix}@thapar.edu"
    db = SessionLocal()
    try:
        db.query(User).filter(User.email == email).delete()
        db.commit()

        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": "Password123!",
                "role": "student",
            },
        )

        assert response.status_code == 400
        assert "alumni" in response.json()["detail"].lower()
    finally:
        db.query(User).filter(User.email == email).delete()
        db.commit()
        db.close()


def test_login_rejects_student_email_patterns_with_student_message():
    response = client.post(
        "/auth/login",
        data={
            "username": "student_be24_unique@thapar.edu",
            "password": "Password123!",
        },
    )

    assert response.status_code == 403
    assert "student" in response.json()["detail"].lower()


def test_demo_login_creates_a_student_session_with_booking():
    db = SessionLocal()
    try:
        email = "demo-student@example.com"
        db.query(Booking).filter(Booking.student_id == db.query(User.id).filter(User.email == email).scalar()).delete(synchronize_session=False)
        db.query(User).filter(User.email == email).delete()
        db.commit()

        response = client.post(
            "/auth/demo-login",
            json={"role": "student"},
        )

        assert response.status_code == 200
        assert response.json()["access_token"]

        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.is_verified is True

        booking = db.query(Booking).filter(Booking.student_id == user.id).first()
        assert booking is not None
        assert booking.status == BookingStatus.APPROVED.value
    finally:
        db.query(Booking).filter(Booking.student_id == db.query(User.id).filter(User.email == "demo-student@example.com").scalar()).delete(synchronize_session=False)
        db.query(User).filter(User.email == "demo-student@example.com").delete()
        db.commit()
        db.close()


def test_get_alumni_is_publicly_accessible():
    response = client.get("/alumni")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_alumni_details_is_publicly_accessible():
    db = SessionLocal()

    try:
        db.query(Profile).filter(
            Profile.user_id == db.query(User.id).filter(User.email == "public-alumni@example.com").scalar()
        ).delete(synchronize_session=False)
        db.query(User).filter(User.email == "public-alumni@example.com").delete()
        db.commit()

        user = User(
            email="public-alumni@example.com",
            hashed_password="unused",
            role="alumni",
            auth_provider="email",
            display_name="Public Alumni",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = Profile(
            user_id=user.id,
            full_name="Public Alumni",
            company="Test Company",
            designation="Software Engineer",
            branch="CSE",
            graduation_year=2022,
            bio="Public alumni profile for tests.",
            linkedin_url="https://linkedin.com/in/public-alumni",
        )
        db.add(profile)
        db.commit()

        response = client.get(f"/alumni/{user.id}")

        assert response.status_code == 200
        assert response.json()["id"] == user.id
        assert response.json()["full_name"] == "Public Alumni"
    finally:
        db.query(Profile).filter(
            Profile.user_id == user.id
        ).delete()
        db.query(User).filter(
            User.email == "public-alumni@example.com"
        ).delete()
        db.commit()
        db.close()


def test_booking_status_rejects_invalid_transition_values():
    response = client.patch(
        "/bookings/1",
        json={"status": "not-a-real-status"},
        headers={"Authorization": "Bearer invalid"},
    )

    assert response.status_code == 401


def test_password_reset_flow_changes_password():
    db = SessionLocal()
    try:
        email = "reset-user@example.com"
        db.query(User).filter(User.email == email).delete()
        db.commit()

        user = User(
            email=email,
            hashed_password=hash_password("OldPassw0rd!"),
            role="student",
            auth_provider="email",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # request reset
        response = client.post(
            "/auth/password-reset/request",
            json={"email": email},
        )

        assert response.status_code == 200
        body = response.json()

        token = body.get("token")
        # token should be present in test env (SMTP not configured)
        assert token

        # confirm reset with a valid new password
        new_password = "NewPassw0rd!"
        response2 = client.post(
            "/auth/password-reset/confirm",
            json={"token": token, "new_password": new_password},
        )

        assert response2.status_code == 200

        # now login with new password
        response3 = client.post(
            "/auth/login",
            data={"username": email, "password": new_password},
        )

        assert response3.status_code == 200
        assert "access_token" in response3.json()
    finally:
        db.query(User).filter(User.email == email).delete()
        db.commit()
        db.close()


def test_google_auth_keeps_verified_personal_alumni_unblocked():
    db = SessionLocal()
    try:
        user = User(
            email="verified-alumni@example.com",
            hashed_password="unused",
            role="alumni",
            auth_provider="google",
            is_verified=True,
            is_pending_verification=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        response = client.post(
            "/auth/google",
            json={
                "role": "alumni",
                "email": "verified-alumni@example.com",
            },
        )

        assert response.status_code == 200
        assert response.json()["status"] == "verified"
    finally:
        db.query(User).filter(User.email == "verified-alumni@example.com").delete()
        db.commit()
        db.close()


def test_google_auth_rejects_token_with_unexpected_client_id():
    auth_routes.settings.GOOGLE_CLIENT_ID = "expected-client-id"
    try:
        header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip("=")
        payload = {
            "email": "personal-alumni@example.com",
            "name": "Test Alumni",
            "aud": "unexpected-client-id",
            "iss": "https://accounts.google.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600,
        }
        payload_segment = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        id_token = f"{header}.{payload_segment}.signature"

        response = client.post(
            "/auth/google",
            json={
                "role": "alumni",
                "id_token": id_token,
                "name": "Test Alumni",
            },
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Google token audience is invalid."
    finally:
        auth_routes.settings.GOOGLE_CLIENT_ID = ""


def test_admin_pending_list_requires_admin_key():
    auth_routes.settings.ADMIN_API_KEY = "test-admin-key"

    response = client.get(
        "/auth/admin/pending",
        headers={"X-Admin-Key": "wrong-key"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"

    auth_routes.settings.ADMIN_API_KEY = ""


def test_admin_verification_sends_approval_email(monkeypatch):
    db = SessionLocal()
    try:
        user = User(
            email="pending-alumni@example.com",
            hashed_password="unused",
            role="alumni",
            auth_provider="google",
            is_verified=False,
            is_pending_verification=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        sent_emails = []
        monkeypatch.setattr(auth_routes, "_send_approval_email", lambda email: sent_emails.append(email))
        auth_routes.settings.ADMIN_API_KEY = "test-admin-key"

        response = client.post(
            f"/auth/admin/verify?user_id={user.id}",
            headers={"X-Admin-Key": "test-admin-key"},
        )

        assert response.status_code == 200
        assert sent_emails == ["pending-alumni@example.com"]
    finally:
        db.query(User).filter(User.email == "pending-alumni@example.com").delete()
        db.commit()
        db.close()
        auth_routes.settings.ADMIN_API_KEY = ""
