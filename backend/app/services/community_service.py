from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User


_POSTS: list[dict[str, Any]] = []


class CommunityPost:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, author: User, title: str, body: str, category: str | None = None):
        if not title.strip() or not body.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title and body are required")

        post = {
            "id": int(datetime.utcnow().timestamp() * 1000),
            "title": title.strip(),
            "body": body.strip(),
            "category": category or "general",
            "author_id": author.id,
            "author_name": author.email,
            "created_at": datetime.utcnow().isoformat(),
            "comments": [],
            "reactions": {},
        }
        _POSTS.append(post)
        return post

    def list_posts(self):
        return list(_POSTS)
