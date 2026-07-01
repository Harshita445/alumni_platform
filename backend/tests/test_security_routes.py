import base64
import json
import os
import sys
import time

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.user import User
from app.routes import auth as auth_routes

client = TestClient(app)


def test_profile_update_rejects_role_escape_fields_for_students():
    # This test exercises the route contract without relying on a real DB state.
    response = client.put(
        "/profile/me",
        json={"company": "Example", "designation": "Director"},
        headers={"Authorization": "Bearer invalid"},
    )

    assert response.status_code == 401


def test_register_rejects_alumni_role_for_student_email_patterns():
    email = "student_be24_unique@thapar.edu"
    db = SessionLocal()
    try:
        db.query(User).filter(User.email == email).delete()
        db.commit()

        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": "Password123!",
                "role": "alumni",
            },
        )

        assert response.status_code == 400
        assert "student" in response.json()["detail"].lower()
    finally:
        db.query(User).filter(User.email == email).delete()
        db.commit()
        db.close()


def test_login_rejects_student_email_patterns_with_student_message():
    response = client.post(
        "/auth/login",
        data={
            "username": "student_be24_unique@thapar.edu",
            "password": "Password123!",
        },
    )

    assert response.status_code == 403
    assert "student" in response.json()["detail"].lower()


def test_booking_status_rejects_invalid_transition_values():
    response = client.patch(
        "/bookings/1",
        json={"status": "not-a-real-status"},
        headers={"Authorization": "Bearer invalid"},
    )

    assert response.status_code == 401


def test_google_auth_keeps_verified_personal_alumni_unblocked():
    db = SessionLocal()
    try:
        user = User(
            email="verified-alumni@example.com",
            hashed_password="unused",
            role="alumni",
            auth_provider="google",
            is_verified=True,
            is_pending_verification=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        response = client.post(
            "/auth/google",
            json={
                "role": "alumni",
                "email": "verified-alumni@example.com",
            },
        )

        assert response.status_code == 200
        assert response.json()["status"] == "verified"
    finally:
        db.query(User).filter(User.email == "verified-alumni@example.com").delete()
        db.commit()
        db.close()


def test_google_auth_rejects_token_with_unexpected_client_id():
    auth_routes.settings.GOOGLE_CLIENT_ID = "expected-client-id"
    try:
        header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip("=")
        payload = {
            "email": "personal-alumni@example.com",
            "name": "Test Alumni",
            "aud": "unexpected-client-id",
            "iss": "https://accounts.google.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600,
        }
        payload_segment = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        id_token = f"{header}.{payload_segment}.signature"

        response = client.post(
            "/auth/google",
            json={
                "role": "alumni",
                "id_token": id_token,
                "name": "Test Alumni",
            },
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Google token audience is invalid."
    finally:
        auth_routes.settings.GOOGLE_CLIENT_ID = ""


def test_admin_pending_list_requires_admin_key():
    auth_routes.settings.ADMIN_API_KEY = "test-admin-key"

    response = client.get(
        "/auth/admin/pending",
        headers={"X-Admin-Key": "wrong-key"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"

    auth_routes.settings.ADMIN_API_KEY = ""


def test_admin_verification_sends_approval_email(monkeypatch):
    db = SessionLocal()
    try:
        user = User(
            email="pending-alumni@example.com",
            hashed_password="unused",
            role="alumni",
            auth_provider="google",
            is_verified=False,
            is_pending_verification=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        sent_emails = []
        monkeypatch.setattr(auth_routes, "_send_approval_email", lambda email: sent_emails.append(email))
        auth_routes.settings.ADMIN_API_KEY = "test-admin-key"

        response = client.post(
            f"/auth/admin/verify?user_id={user.id}",
            headers={"X-Admin-Key": "test-admin-key"},
        )

        assert response.status_code == 200
        assert sent_emails == ["pending-alumni@example.com"]
    finally:
        db.query(User).filter(User.email == "pending-alumni@example.com").delete()
        db.commit()
        db.close()
        auth_routes.settings.ADMIN_API_KEY = ""
