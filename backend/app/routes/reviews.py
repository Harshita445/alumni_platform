from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from pydantic import BaseModel
from pydantic import Field

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user

from app.models.booking import Booking
from app.models.notification import Notification
from app.models.review import Review
from app.models.user import User

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


@router.post("/")
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == payload.booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.student_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )

    if booking.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Session not completed",
        )

    existing = (
        db.query(Review)
        .filter(
            Review.booking_id == payload.booking_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Review already exists",
        )

    review = Review(
        booking_id=booking.id,
        student_id=current_user.id,
        alumni_id=booking.alumni_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(review)
    notification = Notification(
        user_id=booking.alumni_id,
        booking_id=booking.id,
        message=(
            f"You received a new review for the session on {booking.date} "
            f"at {booking.time}."
        ),
    )
    db.add(notification)
    db.commit()

    return {"message": "Review submitted"}
    

@router.get("/alumni/{alumni_id}")
def get_reviews(
    alumni_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Review)
        .filter(
            Review.alumni_id == alumni_id
        )
        .all()
    )
