from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.community_service import CommunityPost

router = APIRouter(prefix="/community", tags=["Community"])


@router.post("/posts", response_model=dict)
def create_post(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CommunityPost(db)
    return service.create_post(current_user, payload.get("title", ""), payload.get("body", ""), payload.get("category"))


@router.get("/posts", response_model=list[dict])
def list_posts(db: Session = Depends(get_db)):
    service = CommunityPost(db)
    return service.list_posts()
