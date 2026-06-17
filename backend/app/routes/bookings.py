from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


class BookingStatusUpdate(BaseModel):
    status: str


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


@router.get("/health")
def bookings_health():
    return {"status": "ok"}


@router.post("/", response_model=BookingResponse)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create bookings.",
        )

    alumni = (
        db.query(User)
        .filter(User.id == payload.alumni_id)
        .filter(User.role == "alumni")
        .first()
    )

    if alumni is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumnus not found.",
        )

    booking = Booking(
        student_id=current_user.id,
        alumni_id=payload.alumni_id,
        session_type=payload.session_type,
        date=payload.date,
        time=payload.time,
        status=BookingStatus.PENDING.value,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    _create_notification(
        db,
        user_id=alumni.id,
        booking_id=booking.id,
        message=(
            f"New booking request from {current_user.email} "
            f"for {booking.date} at {booking.time}."
        ),
    )
    db.commit()

    return booking


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

    if (
        booking.student_id != current_user.id
        and booking.alumni_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking.",
        )

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

    if (
        booking.student_id != current_user.id
        and booking.alumni_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking.",
        )

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

    if requested_status == BookingStatus.UPCOMING:
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

        booking.status = BookingStatus.UPCOMING.value
        _create_notification(
            db,
            user_id=booking.student_id,
            booking_id=booking.id,
            message=(
                f"Your booking request for {booking.date} at {booking.time} "
                f"was accepted by {current_user.email}."
            ),
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
            BookingStatus.UPCOMING.value,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending or upcoming bookings can be cancelled.",
            )

        booking.status = BookingStatus.CANCELLED.value
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
        if booking.status != BookingStatus.UPCOMING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only upcoming bookings can be completed.",
            )

        booking.status = BookingStatus.COMPLETED.value
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