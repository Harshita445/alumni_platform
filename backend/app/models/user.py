from enum import Enum

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class UserRole(str, Enum):
    STUDENT = "student"
    ALUMNI = "alumni"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=True)

    role = Column(String, nullable=False)

    auth_provider = Column(String, default="email")

    provider_id = Column(String, nullable=True)

    display_name = Column(String, nullable=True)

    avatar = Column(String, nullable=True)

    refresh_token_hash = Column(String, nullable=True)

    last_login = Column(DateTime(timezone=True), nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    onboarding_completed = Column(Boolean, default=False)

    verification_status = Column(String, default="approved")

    approved_by = Column(Integer, nullable=True)

    approved_at = Column(DateTime(timezone=True), nullable=True)

    verification_reason = Column(Text, nullable=True)

    is_verified = Column(Boolean, default=False)

    is_pending_verification = Column(Boolean, default=False)

    is_demo = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    profile = relationship(
        "Profile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


student_bookings = relationship(
    "Booking",
    foreign_keys="Booking.student_id",
    back_populates="student",
)

alumni_bookings = relationship(
    "Booking",
    foreign_keys="Booking.alumni_id",
    back_populates="alumni",
)
