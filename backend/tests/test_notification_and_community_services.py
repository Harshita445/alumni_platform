import os
import sys
from uuid import uuid4

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.database import SessionLocal
from app.main import app
from app.models.notification import Notification
from app.models.user import User

client = TestClient(app)


def _create_user(db, role="student"):
    email = f"{role}-{uuid4().hex[:8]}@example.com"
    user = User(
        email=email,
        hashed_password="unused",
        role=role,
        auth_provider="email",
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_notification_routes_support_listing_and_marking_read():
    db = SessionLocal()
    try:
        user = _create_user(db, role="student")
        notification = Notification(user_id=user.id, message="First update")
        db.add(notification)
        db.commit()
        db.refresh(notification)

        token = create_access_token({"sub": str(user.id)})
        headers = {"Authorization": f"Bearer {token}"}

        list_response = client.get("/notifications/me", headers=headers)
        assert list_response.status_code == 200
        assert any(item["id"] == notification.id for item in list_response.json())

        read_response = client.patch(f"/notifications/{notification.id}/read", headers=headers)
        assert read_response.status_code == 200
        assert read_response.json()["is_read"] is True
    finally:
        db.query(Notification).filter(Notification.user_id == user.id).delete(synchronize_session=False)
        db.query(User).filter(User.id == user.id).delete(synchronize_session=False)
        db.commit()
        db.close()


def test_community_posts_can_be_created_and_listed():
    db = SessionLocal()
    try:
        user = _create_user(db, role="student")
        token = create_access_token({"sub": str(user.id)})
        headers = {"Authorization": f"Bearer {token}"}

        create_response = client.post(
            "/community/posts",
            json={"title": "Welcome", "body": "Hello community", "category": "general"},
            headers=headers,
        )
        assert create_response.status_code == 200
        body = create_response.json()
        assert body["title"] == "Welcome"
        assert body["author_id"] == user.id

        list_response = client.get("/community/posts")
        assert list_response.status_code == 200
        assert any(item["id"] == body["id"] for item in list_response.json())
    finally:
        db.query(User).filter(User.id == user.id).delete(synchronize_session=False)
        db.commit()
        db.close()
