import re
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.core.config import settings
from app.models.user import UserRole


class AlumniPersonalRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    linkedin_url: str
    graduation_year: int
    degree: str
    department: str
    company: str
    designation: str
    phone_number: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < settings.PASSWORD_MIN_LENGTH:
            raise ValueError(
                f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
            )
        
        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        
        if settings.PASSWORD_REQUIRE_NUMBERS and not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")
        
        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one special character")
        
        return value

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, value: str, info):
        if info.data.get("password") and value != info.data["password"]:
            raise ValueError("Passwords must match")
        return value


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < settings.PASSWORD_MIN_LENGTH:
            raise ValueError(
                f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
            )

        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")

        if settings.PASSWORD_REQUIRE_NUMBERS and not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")

        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one special character")

        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    provider_id: Optional[str] = None
    role: UserRole


class GoogleAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    status: str
    requires_admin_review: bool = False
    message: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class AdminRejectRequest(BaseModel):
    user_id: int
    reason: Optional[str] = None
