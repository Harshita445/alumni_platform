from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user

from app.models.profile import Profile
from app.models.user import User, UserRole

from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get(
    "/me",
    response_model=ProfileResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        profile = Profile(user_id=current_user.id)

        db.add(profile)
        db.commit()
        db.refresh(profile)

    profile_data = {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.full_name,
        "branch": profile.branch,
        "graduation_year": profile.graduation_year,
        "bio": profile.bio,
        "linkedin_url": profile.linkedin_url,
    }

    if current_user.role == UserRole.ALUMNI.value:
        profile_data["company"] = profile.company
        profile_data["designation"] = profile.designation

    return profile_data


@router.put(
    "/me",
    response_model=ProfileResponse,
)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_data = data.model_dump(exclude_unset=True)

    if current_user.role == UserRole.STUDENT.value:
        update_data.pop("company", None)
        update_data.pop("designation", None)

    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    profile_data = {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.full_name,
        "branch": profile.branch,
        "graduation_year": profile.graduation_year,
        "bio": profile.bio,
        "linkedin_url": profile.linkedin_url,
    }

    if current_user.role == UserRole.ALUMNI.value:
        profile_data["company"] = profile.company
        profile_data["designation"] = profile.designation

    return profile_data
