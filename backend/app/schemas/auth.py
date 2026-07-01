import re
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.core.config import settings
from app.models.user import UserRole


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
    token_type: str = "bearer"
    status: str
    requires_admin_review: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"