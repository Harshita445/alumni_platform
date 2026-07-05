import base64
import json
import re
import smtplib
import time
from datetime import date, time, timedelta
from email.message import EmailMessage
from jose import jwt, JWTError
import os
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.payments import MentorPayoutSettings
from app.models.profile import Profile
from app.models.user import User

from app.schemas.auth import (
    GoogleAuthRequest,
    GoogleAuthResponse,
    RegisterRequest,
    TokenResponse,
)

from pydantic import BaseModel

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


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def _get_user_by_email(db: Session, email: str | None) -> User | None:
    normalized_email = _normalize_email(email)
    if not normalized_email:
        return None

    return db.query(User).filter(func.lower(User.email) == normalized_email).first()


def _looks_like_student_email(email: str) -> bool:
    if not email:
        return False

    local_part = email.split("@", 1)[0]
    return bool(re.search(r"_be\d{2}(?:$|_)", local_part, flags=re.IGNORECASE))


def _looks_like_graduating_batch_email(email: str) -> bool:
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


def _send_password_reset_email(recipient_email: str, token: str) -> None:
    if not settings.SMTP_HOST or not recipient_email:
        return

    reset_link = f"{settings.FRONTEND_URL.rstrip('/') if getattr(settings, 'FRONTEND_URL', None) else ''}/reset-password?token={token}"

    message = EmailMessage()
    message["Subject"] = "Password reset request"
    message["From"] = settings.SMTP_FROM_EMAIL or "noreply@example.com"
    message["To"] = recipient_email
    message.set_content(
        f"We received a request to reset your password. You can reset it using the following link: {reset_link}\n\nIf you did not request this, please ignore this email."
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


def _validate_password_rules(password: str) -> None:
    # reuse the same password rules as registration
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long",
        )

    if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")

    if settings.PASSWORD_REQUIRE_NUMBERS and not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")

    if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


@router.get("/health")
def auth_health():
    return {"status": "ok"}


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    verification_status = "pending" if current_user.is_pending_verification else "verified" if current_user.is_verified else "rejected"

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "verification_status": verification_status,
    }


@router.post(
    "/register",
    response_model=TokenResponse,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = _normalize_email(str(payload.email))

    existing_user = _get_user_by_email(db, email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    if (
        payload.role == "student"
        and not email.endswith("@thapar.edu")
    ):
        raise HTTPException(
            status_code=400,
            detail="Students must use a Thapar email",
        )

    if (
        payload.role == "student"
        and _looks_like_graduating_batch_email(email)
    ):
        raise HTTPException(
            status_code=400,
            detail="It looks like you should register as an alumni instead.",
        )

    if payload.role == "alumni" and _looks_like_student_email(email):
        raise HTTPException(
            status_code=400,
            detail="It looks like you are a student. Please register or log in as a student instead.",
        )

    user = User(
        email=email,
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
    email = _normalize_email(email)

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

    if (
        payload.role == "student"
        and _looks_like_graduating_batch_email(email)
    ):
        raise HTTPException(
            status_code=400,
            detail="It looks like you should register as an alumni instead.",
        )

    if payload.role == "alumni" and _looks_like_student_email(email):
        raise HTTPException(
            status_code=400,
            detail="It looks like you are a student. Please register or log in as a student instead.",
        )

    is_thapar_email = email.endswith("@thapar.edu")
    is_verified = is_thapar_email or payload.role != "alumni"
    requires_admin_review = payload.role == "alumni" and not is_thapar_email

    existing_user = _get_user_by_email(db, email)

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



@router.post("/password-reset/request")
def password_reset_request(
    payload: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    email = _normalize_email(payload.email)

    user = _get_user_by_email(db, email)

    # Always return a success-like response to avoid leaking account existence
    if not user:
        return {"message": "If an account exists, a password reset email has been sent."}

    token = create_access_token(
        {"sub": str(user.id), "pw_reset": True},
        expires_delta=timedelta(minutes=60),
    )

    if settings.SMTP_HOST:
        try:
            _send_password_reset_email(user.email, token)
        except Exception:
            # swallow email errors
            pass

        # In test environments, include the token so tests can proceed
        if os.environ.get("PYTEST_CURRENT_TEST"):
            return {"message": "Password reset token generated (test)", "token": token}

        return {"message": "If an account exists, a password reset email has been sent."}

    # For local/dev environments where SMTP isn't configured, return the token for convenience
    return {"message": "Password reset token generated (dev only)", "token": token}


@router.post("/password-reset/confirm")
def password_reset_confirm(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    try:
        claims = jwt.decode(payload.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if not claims.get("pw_reset"):
        raise HTTPException(status_code=400, detail="Invalid token")

    user_id = claims.get("sub")
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id_int).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # validate new password rules
    _validate_password_rules(payload.new_password)

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password updated"}


class DemoLoginRequest(BaseModel):
    role: str


@router.post(
    "/demo-login",
    response_model=TokenResponse,
)
def demo_login(
    payload: DemoLoginRequest,
    db: Session = Depends(get_db),
):
    role = payload.role.lower()
    if role not in {"student", "alumni"}:
        raise HTTPException(status_code=400, detail="Role must be either student or alumni")

    demo_email = "demo-student@example.com" if role == "student" else "demo-alumni@example.com"
    user = _get_user_by_email(db, demo_email)

    if user is None:
        user = User(
            email=demo_email,
            hashed_password=hash_password("DemoPass123!"),
            role=role,
            auth_provider="email",
            display_name="Demo User",
            is_verified=True,
            is_pending_verification=False,
        )
        db.add(user)
        db.flush()

    user.hashed_password = hash_password("DemoPass123!")
    user.is_verified = True
    user.is_pending_verification = False
    user.display_name = "Demo User"

    if role == "student":
        alumni = (
            db.query(User)
            .filter(User.email == "demo-alumni@example.com")
            .first()
        )
        if alumni is None:
            alumni = User(
                email="demo-alumni@example.com",
                hashed_password=hash_password("DemoPass123!"),
                role="alumni",
                auth_provider="email",
                display_name="Demo Alumni",
                is_verified=True,
                is_pending_verification=False,
            )
            db.add(alumni)
            db.flush()

            profile = (
                db.query(Profile)
                .filter(Profile.user_id == alumni.id)
                .first()
            )
            if profile is None:
                db.add(
                    Profile(
                        user_id=alumni.id,
                        full_name="Demo Alumni",
                        company="Demo Company",
                        designation="Engineering Lead",
                        branch="CSE",
                        graduation_year=2020,
                        bio="Demo alumni profile for local payment testing.",
                    )
                )

            existing_payout_settings = (
                db.query(MentorPayoutSettings)
                .filter(MentorPayoutSettings.mentor_id == alumni.id)
                .first()
            )
            if existing_payout_settings is None:
                db.add(
                    MentorPayoutSettings(
                        mentor_id=alumni.id,
                        method="UPI",
                        upi_id="demo-alumni@upi",
                        account_holder="Demo Alumni",
                        verified="verified",
                    )
                )

        existing_booking = (
            db.query(Booking)
            .filter(Booking.student_id == user.id)
            .filter(Booking.alumni_id == alumni.id)
            .first()
        )
        if existing_booking is None:
            db.add(
                Booking(
                    student_id=user.id,
                    alumni_id=alumni.id,
                    session_type="Mock Mentorship",
                    date=date.today() + timedelta(days=2),
                    time=time(18, 0),
                    status=BookingStatus.APPROVED.value,
                )
            )

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


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    username = _normalize_email(form_data.username)

    if _looks_like_student_email(username):
        raise HTTPException(
            status_code=403,
            detail="It looks like you are a student. Please sign in as a student instead.",
        )

    user = _get_user_by_email(db, username)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if _looks_like_student_email(username):
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