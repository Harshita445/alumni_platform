from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.mentorship_service import MentorshipService
from app.models.user import User
from app.schemas.mentorship_service import (
    MentorshipServiceCreate,
    MentorshipServiceResponse,
)

router = APIRouter(prefix="/mentorship-services", tags=["Mentorship Services"])


@router.post("", response_model=MentorshipServiceResponse)
def upsert_service(
    payload: MentorshipServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "alumni":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni can configure mentorship services.",
        )

    service = (
        db.query(MentorshipService)
        .filter(MentorshipService.alumni_id == current_user.id)
        .filter(MentorshipService.service_type == payload.service_type)
        .first()
    )

    if service is None:
        service = MentorshipService(
            alumni_id=current_user.id,
            service_type=payload.service_type,
            price=payload.price,
            is_enabled=payload.is_enabled,
            currency=payload.currency,
        )
        db.add(service)
    else:
        service.price = payload.price
        service.is_enabled = payload.is_enabled
        service.currency = payload.currency

    db.commit()
    db.refresh(service)
    return service


@router.get("/{alumni_id}", response_model=list[MentorshipServiceResponse])
def get_services(
    alumni_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(MentorshipService)
        .filter(MentorshipService.alumni_id == alumni_id)
        .filter(MentorshipService.is_enabled.is_(True))
        .order_by(MentorshipService.service_type)
        .all()
    )
