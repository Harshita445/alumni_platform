from enum import Enum

from sqlalchemy import Column, DateTime, Date, Time, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    AWAITING_PAYMENT = "awaiting_payment"
    PAID = "paid"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alumni_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    message = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    status_history = Column(JSON, nullable=True)
    status = Column(
        String,
        nullable=False,
        default=BookingStatus.PENDING.value,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
        backref="student_bookings",
    )
    alumni = relationship(
        "User",
        foreign_keys=[alumni_id],
        backref="alumni_bookings",
    )
    payment = relationship(
        "Payment",
        uselist=False,
        back_populates="booking",
    )

    @property
    def payment_status(self):
        return self.payment.status if self.payment else None

    @property
    def payment_id(self):
        return self.payment.id if self.payment else None

    @property
    def payment_gateway(self):
        return self.payment.gateway if self.payment else None
