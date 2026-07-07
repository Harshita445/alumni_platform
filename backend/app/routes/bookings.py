from datetime import datetime, timedelta, date, time

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
)
from app.services.authorization import ensure_booking_participant
from app.services.booking_service import BookingService

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)

BOOKING_DURATION_MINUTES = 30


class BookingStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=20)


def _create_notification(
    db: Session,
    user_id: int,
    booking_id: int,
    message: str,
):
    notification = Notification(
        user_id=user_id,
        booking_id=booking_id,
        message=message,
    )
    db.add(notification)


def _append_status_history(
    booking: Booking,
    status: BookingStatus,
    note: str | None = None,
):
    history = booking.status_history or []
    history.append(
        {
            "status": status.value,
            "changed_at": datetime.utcnow().isoformat(),
            "note": note,
        }
    )
    booking.status_history = history


def _booking_window(date_value: date, time_value: time):
    booking_start = datetime.combine(date_value, time_value)
    booking_end = booking_start + timedelta(minutes=BOOKING_DURATION_MINUTES)

    return booking_start, booking_end


def _has_matching_availability(
    db: Session,
    alumni_id: int,
    booking_start: datetime,
    booking_end: datetime,
):
    if booking_start.date() != booking_end.date():
        return False

    requested_date = booking_start.date()
    requested_day = requested_date.weekday()
    requested_start_time = booking_start.time()
    requested_end_time = booking_end.time()

    availability = (
        db.query(Availability)
        .filter(Availability.alumni_id == alumni_id)
        .filter(
            or_(
                Availability.date == requested_date,
                Availability.day_of_week == requested_day,
            )
        )
        .filter(Availability.start_time <= requested_start_time)
        .filter(Availability.end_time >= requested_end_time)
        .first()
    )

    return availability is not None


def _has_overlapping_booking(
    db: Session,
    alumni_id: int,
    requested_start: datetime,
    requested_end: datetime,
):
    active_bookings = (
        db.query(Booking)
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
        existing_start, existing_end = _booking_window(
            booking.date,
            booking.time,
        )

        if existing_start < requested_end and requested_start < existing_end:
            return True

    return False


@router.get("/health")
def bookings_health():
    return {"status": "ok"}


@router.post("/", response_model=BookingResponse)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.create_booking(current_user, payload.alumni_id, payload)


@router.get("/me", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(
            or_(
                Booking.student_id == current_user.id,
                Booking.alumni_id == current_user.id,
            )
        )
        .all()
    )

    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    ensure_booking_participant(booking, current_user)

    return booking


@router.patch(
    "/{booking_id}",
    response_model=BookingResponse,
)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    ensure_booking_participant(booking, current_user)

    try:
        requested_status = BookingStatus(payload.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status.",
        )

    if requested_status == BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revert booking to pending.",
        )

    if requested_status == BookingStatus.APPROVED:
        if current_user.is_demo:
            booking.status = BookingStatus.APPROVED.value
            _append_status_history(booking, BookingStatus.APPROVED, "Demo booking approved")
            _create_notification(db, user_id=booking.student_id, booking_id=booking.id, message="Demo booking approved.")
            db.commit()
            db.refresh(booking)
            return booking
        if current_user.id != booking.alumni_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned alumni can accept this booking.",
            )
        if booking.status != BookingStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending bookings can be accepted.",
            )

        booking.status = BookingStatus.APPROVED.value
        _append_status_history(
            booking,
            BookingStatus.APPROVED,
            "Mentor approved the request",
        )
        _create_notification(
            db,
            user_id=booking.student_id,
            booking_id=booking.id,
            message=(
                f"Your booking request for {booking.date} at {booking.time} "
                f"was accepted by {current_user.email}."
            ),
        )

    elif requested_status == BookingStatus.AWAITING_PAYMENT:
        if current_user.id != booking.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the booking student can proceed to payment.",
            )
        if booking.status != BookingStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only approved bookings can move to payment.",
            )

        booking.status = BookingStatus.AWAITING_PAYMENT.value
        _append_status_history(
            booking,
            BookingStatus.AWAITING_PAYMENT,
            "Student moved the booking to payment",
        )

    elif requested_status == BookingStatus.PAID:
        if current_user.id != booking.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the booking student can confirm payment.",
            )
        if booking.status != BookingStatus.AWAITING_PAYMENT.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only awaiting-payment bookings can be marked paid.",
            )

        booking.status = BookingStatus.PAID.value
        _append_status_history(
            booking,
            BookingStatus.PAID,
            "Student confirmed payment",
        )

    elif requested_status == BookingStatus.CONFIRMED:
        if current_user.is_demo:
            booking.status = BookingStatus.CONFIRMED.value
            booking.meeting_link = "https://meet.google.com/demo-session"
            _append_status_history(booking, BookingStatus.CONFIRMED, "Demo booking confirmed")
            _create_notification(db, user_id=booking.student_id, booking_id=booking.id, message="Booking confirmed (Demo)")
            db.commit()
            db.refresh(booking)
            return booking

        if current_user.id != booking.alumni_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned alumni can confirm this booking.",
            )
        if booking.status != BookingStatus.PAID.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only paid bookings can be confirmed.",
            )

        booking.status = BookingStatus.CONFIRMED.value
        booking.meeting_link = (
            f"https://meet.google.com/{booking.id}{booking.alumni_id}{booking.student_id}"
        )
        _append_status_history(
            booking,
            BookingStatus.CONFIRMED,
            "Mentor confirmed the session",
        )

    elif requested_status == BookingStatus.REJECTED:
        if current_user.id != booking.alumni_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned alumni can reject this booking.",
            )
        if booking.status != BookingStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending bookings can be rejected.",
            )

        booking.status = BookingStatus.REJECTED.value
        _append_status_history(
            booking,
            BookingStatus.REJECTED,
            "Mentor rejected the request",
        )
        _create_notification(
            db,
            user_id=booking.student_id,
            booking_id=booking.id,
            message=(
                f"Your booking request for {booking.date} at {booking.time} "
                f"was rejected by {current_user.email}."
            ),
        )

    elif requested_status == BookingStatus.CANCELLED:
        if current_user.id != booking.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the booking student can cancel this booking.",
            )
        if booking.status not in (
            BookingStatus.PENDING.value,
            BookingStatus.APPROVED.value,
            BookingStatus.AWAITING_PAYMENT.value,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending, approved, or awaiting payment bookings can be cancelled.",
            )

        booking.status = BookingStatus.CANCELLED.value
        _append_status_history(
            booking,
            BookingStatus.CANCELLED,
            "Student cancelled the booking",
        )
        _create_notification(
            db,
            user_id=booking.alumni_id,
            booking_id=booking.id,
            message=(
                f"The booking request for {booking.date} at {booking.time} "
                f"was cancelled by the student."
            ),
        )

    elif requested_status == BookingStatus.COMPLETED:
        if current_user.id != booking.alumni_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned alumni can complete this booking.",
            )
        if booking.status != BookingStatus.CONFIRMED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only confirmed bookings can be completed.",
            )

        booking.status = BookingStatus.COMPLETED.value
        _append_status_history(
            booking,
            BookingStatus.COMPLETED,
            "Mentor marked the session complete",
        )
        _create_notification(
            db,
            user_id=booking.student_id,
            booking_id=booking.id,
            message=(
                f"Your session on {booking.date} at {booking.time} "
                f"was marked as completed by {current_user.email}."
            ),
        )

    db.commit()
    db.refresh(booking)

    return booking
