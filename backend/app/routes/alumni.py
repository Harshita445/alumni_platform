from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.profile import Profile
from app.models.user import User
from app.schemas.alumni import AlumniResponse

router = APIRouter(
    prefix="/alumni",
    tags=["Alumni"],
)


@router.get(
    "/",
    response_model=list[AlumniResponse],
)
def get_alumni(
    page: int = 1,
    limit: int = 10,
    company: Optional[str] = None,
    branch: Optional[str] = None,
    graduation_year: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 50:
        limit = 50
    
    query = (
        db.query(Profile)
        .join(User)
        .filter(User.role == "alumni")
    )

    if company:
        company = company.strip()
        query = query.filter(
            Profile.company.ilike(f"%{company}%")
        )

    if branch:
        branch = branch.strip()
        query = query.filter(
            Profile.branch.ilike(f"%{branch}%")
        )

    if graduation_year:
        query = query.filter(
            Profile.graduation_year == graduation_year
        )

    if search:
        search = search.strip()
        if len(search) > 80:
            search = search[:80]
        query = query.filter(
            or_(
                Profile.full_name.ilike(f"%{search}%"),
                Profile.company.ilike(f"%{search}%"),
                Profile.designation.ilike(f"%{search}%"),
                Profile.bio.ilike(f"%{search}%"),
            )
        )
    
    offset = (page - 1) * limit
    profiles = query.offset(offset).limit(limit).all()

    return [
        {
            "id": p.user_id,
            "full_name": p.full_name,
            "branch": p.branch,
            "graduation_year": p.graduation_year,
            "company": p.company,
            "designation": p.designation,
            "bio": p.bio,
            "linkedin_url": p.linkedin_url,
        }
        for p in profiles
    ]


@router.get(
    "/{alumni_id}",
    response_model=AlumniResponse,
)
def get_alumni_details(
    alumni_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .join(User)
        .filter(
            User.id == alumni_id,
            User.role == "alumni",
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumnus not found.",
        )

    return {
        "id": profile.user_id,
        "full_name": profile.full_name,
        "branch": profile.branch,
        "graduation_year": profile.graduation_year,
        "company": profile.company,
        "designation": profile.designation,
        "bio": profile.bio,
        "linkedin_url": profile.linkedin_url,
    }
