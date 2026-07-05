import os
import sys

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.database import SessionLocal
from app.main import app
from app.models.profile import Profile
from app.models.user import User

client = TestClient(app)


def test_student_profile_update_persists_skills_and_goals():
    db = SessionLocal()
    try:
        user = User(
            email="student-profile-test@example.com",
            hashed_password="unused",
            role="student",
            auth_provider="email",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id)})

        response = client.put(
            "/profile/me",
            json={
                "full_name": "Test Student",
                "branch": "CSE",
                "graduation_year": 2026,
                "skills": ["Python", "SQL"],
                "career_interests": ["Product", "Startups"],
                "goals": "Build a strong product portfolio.",
                "target_companies": ["Google", "Stripe"],
                "desired_roles": ["Product Manager"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["full_name"] == "Test Student"
        assert body["skills"] == ["Python", "SQL"]
        assert body["career_interests"] == ["Product", "Startups"]
        assert body["goals"] == "Build a strong product portfolio."
        assert body["target_companies"] == ["Google", "Stripe"]
        assert body["desired_roles"] == ["Product Manager"]
    finally:
        db.query(Profile).filter(Profile.user_id == user.id).delete()
        db.query(User).filter(User.id == user.id).delete()
        db.commit()
        db.close()
