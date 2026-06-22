from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.availability import Availability
from app.models.user import User
from app.schemas.availability import AvailabilityCreate, AvailabilityResponse

router = APIRouter(
    prefix="/availability",
    tags=["Availability"],
)


@router.post("/", response_model=AvailabilityResponse)
def create_availability(
    payload: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "alumni":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni can create availability slots.",
        )

    availability = Availability(
        alumni_id=current_user.id,
        day_of_week=payload.day_of_week,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )

    db.add(availability)
    db.commit()
    db.refresh(availability)

    return availability


@router.get("/{alumni_id}", response_model=list[AvailabilityResponse])
def get_availability(
    alumni_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alumni = (
        db.query(User)
        .filter(User.id == alumni_id)
        .filter(User.role == "alumni")
        .first()
    )

    if alumni is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumnus not found.",
        )

    return (
        db.query(Availability)
        .filter(Availability.alumni_id == alumni_id)
        .order_by(
            Availability.date.is_(None),
            Availability.date,
            Availability.day_of_week,
            Availability.start_time,
        )
        .all()
    )


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    availability = (
        db.query(Availability)
        .filter(Availability.id == availability_id)
        .first()
    )

    if availability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found.",
        )

    if availability.alumni_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this availability slot.",
        )

    db.delete(availability)
    db.commit()

    return None
