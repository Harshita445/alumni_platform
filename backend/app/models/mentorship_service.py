from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class MentorshipService(Base):
    __tablename__ = "mentorship_services"

    id = Column(Integer, primary_key=True, index=True)
    alumni_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_type = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    is_enabled = Column(Boolean, nullable=False, default=True)
    currency = Column(String, nullable=True, default="INR")

    alumni = relationship(
        "User",
        foreign_keys=[alumni_id],
        backref="mentorship_services",
    )
