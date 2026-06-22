from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.profile import Profile
from app.models.saved_alumni import SavedAlumni
from app.models.user import User
from app.schemas.saved import SavedAlumniResponse

router = APIRouter(
    prefix="/saved",
    tags=["Saved Alumni"],
)


@router.post("/{alumni_id}")
def save_alumni(
    alumni_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Students only",
        )

    alumni = db.query(User).filter(
        User.id == alumni_id,
        User.role == "alumni",
    ).first()

    if not alumni:
        raise HTTPException(
            status_code=404,
            detail="Alumni not found",
        )

    existing = db.query(SavedAlumni).filter(
        SavedAlumni.student_id == current_user.id,
        SavedAlumni.alumni_id == alumni_id,
    ).first()

    if existing:
        return {"message": "Already saved"}

    saved = SavedAlumni(
        student_id=current_user.id,
        alumni_id=alumni_id,
    )

    db.add(saved)
    db.commit()

    return {"message": "Alumni saved successfully"}


@router.delete("/{alumni_id}")
def remove_saved_alumni(
    alumni_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = db.query(SavedAlumni).filter(
        SavedAlumni.student_id == current_user.id,
        SavedAlumni.alumni_id == alumni_id,
    ).first()

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Not found",
        )

    db.delete(saved)
    db.commit()

    return {"message": "Removed successfully"}


@router.get(
    "/me",
    response_model=list[SavedAlumniResponse],
)
def get_saved_alumni(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = (
        db.query(SavedAlumni)
        .filter(
            SavedAlumni.student_id == current_user.id
        )
        .all()
    )

    response = []

    for item in saved:
        profile = (
            db.query(Profile)
            .filter(
                Profile.user_id == item.alumni_id
            )
            .first()
        )

        if profile:
            response.append(
                SavedAlumniResponse(
                    id=profile.user_id,
                    full_name=profile.full_name,
                    branch=profile.branch,
                    graduation_year=profile.graduation_year,
                    company=profile.company,
                    designation=profile.designation,
                    bio=profile.bio,
                    linkedin_url=profile.linkedin_url,
                )
            )

    return response