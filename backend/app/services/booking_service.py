from datetime import datetime, timedelta, date, time

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification
from app.models.user import User

BOOKING_DURATION_MINUTES = 30


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def create_booking(self, student: User, alumni_id: int, payload) -> Booking:
        if student.role != "student":
            raise HTTPException(status_code=403, detail="Only students can create bookings.")

        alumni = self.db.query(User).filter(User.id == alumni_id).filter(User.role == "alumni").first()
        if alumni is None:
            raise HTTPException(status_code=404, detail="Alumnus not found.")

        requested_start, requested_end = self._booking_window(payload.date, payload.time)
        if requested_start <= datetime.now():
            raise HTTPException(status_code=400, detail="Booking time must be in the future.")
        if not self._has_matching_availability(alumni_id, requested_start, requested_end):
            raise HTTPException(status_code=400, detail="Selected time is not within alumni availability.")
        if self._has_overlapping_booking(alumni_id, requested_start, requested_end):
            raise HTTPException(status_code=409, detail="This alumni slot overlaps an existing booking.")

        booking = Booking(
            student_id=student.id,
            alumni_id=alumni_id,
            session_type=payload.session_type,
            date=payload.date,
            time=payload.time,
            message=payload.message,
            status=BookingStatus.PENDING.value,
            status_history=[
                {
                    "status": BookingStatus.PENDING.value,
                    "changed_at": datetime.utcnow().isoformat(),
                    "note": "Request submitted",
                }
            ],
        )
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)

        self._create_notification(
            user_id=alumni.id,
            booking_id=booking.id,
            message=f"New booking request from {student.email} for {booking.date} at {booking.time}.",
        )
        self.db.commit()
        return booking

    def _booking_window(self, date_value: date, time_value: time):
        booking_start = datetime.combine(date_value, time_value)
        booking_end = booking_start + timedelta(minutes=BOOKING_DURATION_MINUTES)
        return booking_start, booking_end

    def _has_matching_availability(self, alumni_id: int, booking_start: datetime, booking_end: datetime):
        if booking_start.date() != booking_end.date():
            return False

        requested_date = booking_start.date()
        requested_day = requested_date.weekday()
        requested_start_time = booking_start.time()
        requested_end_time = booking_end.time()

        availability = (
            self.db.query(Availability)
            .filter(Availability.alumni_id == alumni_id)
            .filter(or_(Availability.date == requested_date, Availability.day_of_week == requested_day))
            .filter(Availability.start_time <= requested_start_time)
            .filter(Availability.end_time >= requested_end_time)
            .first()
        )
        return availability is not None

    def _has_overlapping_booking(self, alumni_id: int, requested_start: datetime, requested_end: datetime):
        active_bookings = (
            self.db.query(Booking)
            .filter(Booking.alumni_id == alumni_id)
            .filter(Booking.date == requested_start.date())
            .filter(
                Booking.status.in_(
                    [
                        BookingStatus.PENDING.value,
                        BookingStatus.APPROVED.value,
                        BookingStatus.AWAITING_PAYMENT.value,
                        BookingStatus.PAID.value,
                        BookingStatus.CONFIRMED.value,
                    ]
                )
            )
            .all()
        )

        for booking in active_bookings:
            existing_start, existing_end = self._booking_window(booking.date, booking.time)
            if existing_start < requested_end and requested_start < existing_end:
                return True
        return False

    def _create_notification(self, user_id: int, booking_id: int, message: str):
        notification = Notification(user_id=user_id, booking_id=booking_id, message=message)
        self.db.add(notification)
