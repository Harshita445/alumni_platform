from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    full_name = Column(String, nullable=True)

    branch = Column(String, nullable=True)

    graduation_year = Column(Integer, nullable=True)

    company = Column(String, nullable=True)

    designation = Column(String, nullable=True)

    bio = Column(Text, nullable=True)

    linkedin_url = Column(String, nullable=True)

    user = relationship(
        "User",
        back_populates="profile",
    )