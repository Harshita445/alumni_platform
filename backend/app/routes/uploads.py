from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.profile import Profile
from app.models.user import User, UserRole
from app.services.upload_service import CloudinaryUploadService

router = APIRouter(prefix="/api/upload", tags=["Uploads"])
upload_service = CloudinaryUploadService()


def _get_or_create_profile(db: Session, user: User) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/profile-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {UserRole.STUDENT.value, UserRole.ALUMNI.value}:
        raise HTTPException(status_code=403, detail="Unsupported user role")

    if current_user.is_demo:
        return {
            "message": "Profile picture upload simulated.",
            "url": "https://res.cloudinary.com/demo/image/upload/v1/demo-profile.png",
            "public_id": "demo-profile-picture",
        }

    profile = _get_or_create_profile(db, current_user)
    previous_public_id = profile.profile_picture_public_id

    try:
        upload_result = upload_service.upload_profile_picture(
            file=file,
            user_role=current_user.role,
            previous_public_id=previous_public_id,
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=500, detail="Profile picture upload failed") from exc

    profile.profile_picture_url = upload_result.get("url")
    profile.profile_picture_public_id = upload_result.get("public_id")
    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile picture uploaded successfully",
        "url": profile.profile_picture_url,
        "public_id": profile.profile_picture_public_id,
    }


@router.post("/resume")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {UserRole.STUDENT.value, UserRole.ALUMNI.value}:
        raise HTTPException(status_code=403, detail="Unsupported user role")

    if current_user.is_demo:
        return {
            "message": "Resume upload simulated.",
            "url": "https://res.cloudinary.com/demo/raw/upload/v1/demo-resume.pdf",
            "public_id": "demo-resume",
        }

    profile = _get_or_create_profile(db, current_user)
    previous_public_id = profile.resume_public_id

    try:
        upload_result = upload_service.upload_resume(
            file=file,
            user_role=current_user.role,
            previous_public_id=previous_public_id,
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=500, detail="Resume upload failed") from exc

    profile.resume_url = upload_result.get("url")
    profile.resume_public_id = upload_result.get("public_id")
    db.commit()
    db.refresh(profile)

    return {
        "message": "Resume uploaded successfully",
        "url": profile.resume_url,
        "public_id": profile.resume_public_id,
    }
