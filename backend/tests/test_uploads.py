from types import SimpleNamespace

from fastapi.testclient import TestClient
import pytest

from app.database import get_db
from app.main import app
from app.routes import uploads as uploads_module


def _override_get_db():
    db = SimpleNamespace(commit=lambda: None, refresh=lambda *_args, **_kwargs: None)
    try:
        yield db
    finally:
        pass


@pytest.fixture
def client():
    # Scope the get_db override to this fixture only, and clean up afterwards.
    app.dependency_overrides[get_db] = _override_get_db
    tc = TestClient(app)
    try:
        yield tc
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_upload_profile_picture_requires_auth(client):
    response = client.post(
        "/api/upload/profile-picture",
        files={"file": ("photo.png", b"fake-image", "image/png")},
    )

    assert response.status_code == 401


def test_upload_profile_picture_persists_cloudinary_metadata(client, monkeypatch):
    profile_state = SimpleNamespace(
        profile_picture_url=None,
        profile_picture_public_id=None,
        resume_url=None,
        resume_public_id=None,
    )

    def override_current_user():
        return SimpleNamespace(id=1, role="student", email="student@example.com")

    app.dependency_overrides[uploads_module.get_current_user] = override_current_user

    def fake_get_or_create_profile(_db, _user):
        return profile_state

    def fake_upload_profile_picture(file, user_role, previous_public_id=None):
        return {"url": "https://example.com/avatar.png", "public_id": "avatar-123"}

    monkeypatch.setattr(uploads_module, "_get_or_create_profile", fake_get_or_create_profile)
    monkeypatch.setattr(uploads_module.upload_service, "upload_profile_picture", fake_upload_profile_picture)

    response = client.post(
        "/api/upload/profile-picture",
        files={"file": ("photo.png", b"fake-image", "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["url"].startswith("https://")
    assert profile_state.profile_picture_url == "https://example.com/avatar.png"
    assert profile_state.profile_picture_public_id == "avatar-123"
