import base64
import json
import re
import smtplib
import time
from email.message import EmailMessage
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.auth import (
    GoogleAuthRequest,
    GoogleAuthResponse,
    RegisterRequest,
    TokenResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _require_admin_access(admin_key: str | None) -> None:
    if not settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Admin verification is not configured",
        )

    if admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")


def _looks_like_student_email(email: str) -> bool:
    if not email:
        return False

    local_part = email.split("@", 1)[0]
    return bool(re.search(r"_be2[3456](?:$|_)", local_part, flags=re.IGNORECASE))


def _send_approval_email(recipient_email: str) -> None:
    if not settings.SMTP_HOST or not recipient_email:
        return

    message = EmailMessage()
    message["Subject"] = "Your alumni account has been approved"
    message["From"] = settings.SMTP_FROM_EMAIL or "noreply@example.com"
    message["To"] = recipient_email
    message.set_content(
        "Your alumni account has been approved. You can now sign in to the platform."
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 25) as server:
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)


def _validate_google_claims(claims: dict) -> None:
    audience = claims.get("aud")
    if settings.GOOGLE_CLIENT_ID:
        if not audience:
            raise HTTPException(
                status_code=401,
                detail="Google token is missing audience.",
            )
        if str(audience) != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=401,
                detail="Google token audience is invalid.",
            )

    issuer = claims.get("iss")
    if issuer not in {"https://accounts.google.com", "accounts.google.com"}:
        raise HTTPException(
            status_code=401,
            detail="Google token issuer is invalid.",
        )

    if claims.get("email_verified") is False:
        raise HTTPException(
            status_code=401,
            detail="Google email is not verified.",
        )

    expiry = claims.get("exp")
    if expiry is not None:
        try:
            if int(expiry) < int(time.time()):
                raise HTTPException(
                    status_code=401,
                    detail="Google token has expired.",
                )
        except (TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=401,
                detail="Google token has invalid expiration.",
            ) from exc


def _extract_google_identity(
    id_token: Optional[str],
    fallback_email: Optional[str],
    fallback_name: Optional[str],
):
    email = (fallback_email or "").strip().lower()
    name = fallback_name or None
    provider_id = None

    if not id_token:
        return email, name, provider_id

    try:
        parts = id_token.split(".")
        if len(parts) < 2:
            return email, name, provider_id

        payload_segment = parts[1]
        padding = "=" * ((4 - len(payload_segment) % 4) % 4)
        decoded = base64.urlsafe_b64decode(payload_segment + padding)
        claims = json.loads(decoded.decode("utf-8"))
        _validate_google_claims(claims)

        if not email and claims.get("email"):
            email = str(claims["email"]).strip().lower()

        if not name and claims.get("name"):
            name = str(claims["name"])

        provider_id = claims.get("sub") or provider_id
    except HTTPException:
        raise
    except Exception:
        return email, name, provider_id

    return email, name, provider_id


@router.get("/health")
def auth_health():
    return {"status": "ok"}


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.post(
    "/register",
    response_model=TokenResponse,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    if (
        payload.role == "student"
        and not payload.email.endswith("@thapar.edu")
    ):
        raise HTTPException(
            status_code=400,
            detail="Students must use a Thapar email",
        )

    if payload.role == "alumni" and _looks_like_student_email(payload.email):
        raise HTTPException(
            status_code=400,
            detail="It looks like you are a student. Please register or log in as a student instead.",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(
            payload.password
        ),
        role=payload.role,
        is_verified=True,
        auth_provider="email",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/admin/pending")
def list_pending_users(
    db: Session = Depends(get_db),
    admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
):
    _require_admin_access(admin_key)

    users = (
        db.query(User)
        .filter(User.is_pending_verification.is_(True))
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "auth_provider": user.auth_provider,
            "display_name": user.display_name,
            "is_verified": user.is_verified,
            "is_pending_verification": user.is_pending_verification,
        }
        for user in users
    ]


@router.post(
    "/admin/verify",
)
def verify_pending_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
):
    _require_admin_access(admin_key)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_pending_verification:
        user.is_verified = True
        user.is_pending_verification = False
        db.commit()
        return {"message": "User already verified"}

    user.is_verified = True
    user.is_pending_verification = False
    db.commit()
    db.refresh(user)
    _send_approval_email(user.email)

    return {
        "message": "User verified successfully",
        "email": user.email,
        "role": user.role,
    }


@router.post(
    "/google",
    response_model=GoogleAuthResponse,
)
def google_auth(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    email, name, provider_id = _extract_google_identity(
        payload.id_token,
        payload.email,
        payload.name,
    )
    provider_id = payload.provider_id or provider_id
    email = (email or "").strip().lower()

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google email is required.",
        )

    if payload.role == "student" and not email.endswith("@thapar.edu"):
        raise HTTPException(
            status_code=400,
            detail="Students must use a Thapar email.",
        )

    if payload.role == "alumni" and _looks_like_student_email(email):
        raise HTTPException(
            status_code=400,
            detail="It looks like you are a student. Please register or log in as a student instead.",
        )

    is_thapar_email = email.endswith("@thapar.edu")
    is_verified = is_thapar_email or payload.role != "alumni"
    requires_admin_review = payload.role == "alumni" and not is_thapar_email

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user and existing_user.role != payload.role:
        raise HTTPException(
            status_code=409,
            detail="This email is already linked to a different account type.",
        )

    if existing_user:
        user = existing_user
        user.auth_provider = "google"
        user.provider_id = provider_id or user.provider_id
        user.display_name = name or user.display_name

        if user.is_verified and user.role == "alumni":
            user.is_verified = True
            user.is_pending_verification = False
        else:
            user.is_verified = is_verified
            user.is_pending_verification = requires_admin_review
    else:
        user = User(
            email=email,
            hashed_password=hash_password(
                provider_id or email or "google-oauth"
            ),
            role=payload.role,
            auth_provider="google",
            provider_id=provider_id,
            display_name=name,
            is_verified=is_verified,
            is_pending_verification=requires_admin_review,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    if user.is_pending_verification:
        raise HTTPException(
            status_code=403,
            detail="Your alumni account is pending admin verification.",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "status": "verified",
        "requires_admin_review": False,
    }


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    if _looks_like_student_email(form_data.username):
        raise HTTPException(
            status_code=403,
            detail="It looks like you are a student. Please sign in as a student instead.",
        )

    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if _looks_like_student_email(form_data.username):
        raise HTTPException(
            status_code=403,
            detail="It looks like you are a student. Please sign in as a student instead.",
        )

    if user.is_pending_verification:
        raise HTTPException(
            status_code=403,
            detail="Your alumni account is pending admin verification.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please verify your email before logging in.",
        )

    if not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }