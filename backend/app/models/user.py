from enum import Enum

from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base
from sqlalchemy.orm import relationship

class UserRole(str, Enum):
    STUDENT = "student"
    ALUMNI = "alumni"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    is_verified = Column(Boolean, default=False)

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