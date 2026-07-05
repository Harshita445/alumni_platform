from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PaymentStatus(str, Enum):
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAID = "PAID"
    COMPLETED = "COMPLETED"
    PAYOUT_PENDING = "PAYOUT_PENDING"
    READY_FOR_TRANSFER = "READY_FOR_TRANSFER"
    PAID_OUT = "PAID_OUT"
    REFUNDED = "REFUNDED"
    CANCELLED = "CANCELLED"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    gross_amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), nullable=False)
    mentor_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, nullable=False, default="INR")
    status = Column(String, nullable=False, default=PaymentStatus.PAYMENT_PENDING.value)
    gateway = Column(String, nullable=False, default="dummy")
    gateway_order_id = Column(String, nullable=True)
    gateway_payment_id = Column(String, nullable=True)
    transfer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking", back_populates="payment")


class MentorPayoutSettings(Base):
    __tablename__ = "mentor_payout_settings"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    method = Column(String, nullable=False, default="UPI")
    upi_id = Column(String, nullable=True)
    account_holder = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    ifsc = Column(String, nullable=True)
    beneficiary_id = Column(String, nullable=True)
    verified = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, nullable=False, default=PaymentStatus.PAYOUT_PENDING.value)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
