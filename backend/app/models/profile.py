from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    full_name = Column(String, nullable=True)

    branch = Column(String, nullable=True)

    graduation_year = Column(Integer, nullable=True)

    company = Column(String, nullable=True)

    designation = Column(String, nullable=True)

    degree = Column(String, nullable=True)

    department = Column(String, nullable=True)

    phone_number = Column(String, nullable=True)

    bio = Column(Text, nullable=True)

    linkedin_url = Column(String, nullable=True)

    profile_picture_url = Column(String, nullable=True)
    profile_picture_public_id = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    resume_public_id = Column(String, nullable=True)

    skills = Column(JSON, nullable=True)
    career_interests = Column(JSON, nullable=True)
    goals = Column(Text, nullable=True)
    target_companies = Column(JSON, nullable=True)
    desired_roles = Column(JSON, nullable=True)
    expertise = Column(JSON, nullable=True)
    mentorship_services = Column(JSON, nullable=True)

    user = relationship(
        "User",
        back_populates="profile",
    )
