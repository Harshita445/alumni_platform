from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.booking import Booking
from app.models.saved_alumni import SavedAlumni
from app.models.user import User
from app.schemas.dashboard import (
    AlumniDashboardResponse,
    RecentBooking,
    StudentDashboardResponse,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/student",
    response_model=StudentDashboardResponse,
)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Students only",
        )

    pending = db.query(Booking).filter(
        Booking.student_id == current_user.id,
        Booking.status == "pending",
    ).count()

    upcoming = db.query(Booking).filter(
        Booking.student_id == current_user.id,
        Booking.status == "upcoming",
    ).count()

    completed = db.query(Booking).filter(
        Booking.student_id == current_user.id,
        Booking.status == "completed",
    ).count()

    saved = db.query(SavedAlumni).filter(
        SavedAlumni.student_id == current_user.id,
    ).count()

    bookings = (
        db.query(Booking)
        .filter(
            Booking.student_id == current_user.id
        )
        .order_by(Booking.id.desc())
        .limit(5)
        .all()
    )

    recent = []

    for booking in bookings:
        recent.append(
            RecentBooking(
                id=booking.id,
                name=booking.alumni.profile.full_name
                if booking.alumni.profile
                else booking.alumni.email,
                date=booking.date,
                time=booking.time,
                status=booking.status,
            )
        )

    return {
        "pending_requests": pending,
        "upcoming_sessions": upcoming,
        "completed_sessions": completed,
        "saved_alumni": saved,
        "recent_bookings": recent,
    }


@router.get(
    "/alumni",
    response_model=AlumniDashboardResponse,
)
def alumni_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "alumni":
        raise HTTPException(
            status_code=403,
            detail="Alumni only",
        )

    pending = db.query(Booking).filter(
        Booking.alumni_id == current_user.id,
        Booking.status == "pending",
    ).count()

    upcoming = db.query(Booking).filter(
        Booking.alumni_id == current_user.id,
        Booking.status == "upcoming",
    ).count()

    completed = db.query(Booking).filter(
        Booking.alumni_id == current_user.id,
        Booking.status == "completed",
    ).count()

    students_helped = db.query(
        func.count(
            distinct(Booking.student_id)
        )
    ).filter(
        Booking.alumni_id == current_user.id,
        Booking.status == "completed",
    ).scalar()

    bookings = (
        db.query(Booking)
        .filter(
            Booking.alumni_id == current_user.id
        )
        .order_by(Booking.id.desc())
        .limit(5)
        .all()
    )

    recent = []

    for booking in bookings:
        recent.append(
            RecentBooking(
                id=booking.id,
                name=booking.student.profile.full_name
                if booking.student.profile
                else booking.student.email,
                date=booking.date,
                time=booking.time,
                status=booking.status,
            )
        )

    return {
        "pending_requests": pending,
        "upcoming_sessions": upcoming,
        "completed_sessions": completed,
        "total_students_helped": students_helped,
        "recent_bookings": recent,
    }