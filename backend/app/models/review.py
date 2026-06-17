from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import UniqueConstraint

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        UniqueConstraint(
            "booking_id",
            name="uq_booking_review",
        ),
    )

    id = Column(Integer, primary_key=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
    )

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    alumni_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    rating = Column(Integer, nullable=False)

    comment = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    booking = relationship("Booking")