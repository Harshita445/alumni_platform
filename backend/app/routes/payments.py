from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.mentorship_service import MentorshipService
from app.models.notification import Notification
from app.models.payments import MentorPayoutSettings, Payment, Payout, PaymentStatus
from app.models.user import User
from app.schemas.payment import PaymentCreateInput, PaymentResponse, PayoutSettingsInput, PayoutSettingsResponse
from app.services.authorization import require_role
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])
payment_service = PaymentService()


@router.post("", response_model=PaymentResponse)
def create_payment(payload: PaymentCreateInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the booking student can pay")
    if booking.status not in ("approved", "awaiting_payment"):
        raise HTTPException(status_code=400, detail="Booking is not ready for payment")

    payout_settings = db.query(MentorPayoutSettings).filter(MentorPayoutSettings.mentor_id == booking.alumni_id).first()
    if payout_settings is None:
        raise HTTPException(status_code=400, detail="Mentor payout details are not configured")

    existing_payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if existing_payment is not None:
        return existing_payment

    mentorship_service = (
        db.query(MentorshipService)
        .filter(
            MentorshipService.alumni_id == booking.alumni_id,
            MentorshipService.service_type == booking.session_type,
            MentorshipService.is_enabled.is_(True),
        )
        .first()
    )
    gross_amount = Decimal(str(mentorship_service.price)) if mentorship_service and mentorship_service.price is not None else Decimal("299")

    payment_data = payment_service.createPayment(
        booking_id=booking.id,
        student_id=booking.student_id,
        mentor_id=booking.alumni_id,
        gross_amount=gross_amount,
    )

    payment_payload = {
        key: value
        for key, value in payment_data.items()
        if key in {"booking_id", "student_id", "mentor_id", "gross_amount", "platform_fee", "mentor_amount", "currency", "status", "gateway", "gateway_order_id"}
    }
    payment = Payment(**payment_payload)
    booking.status = BookingStatus.AWAITING_PAYMENT.value
    booking.status_history = (booking.status_history or []) + [
        {
            "status": BookingStatus.AWAITING_PAYMENT.value,
            "changed_at": datetime.utcnow().isoformat(),
            "note": "Awaiting student payment",
        }
    ]
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def _create_notification(
    db: Session,
    user_id: int,
    booking_id: int,
    message: str,
):
    notification = Notification(
        user_id=user_id,
        booking_id=booking_id,
        message=message,
    )
    db.add(notification)


@router.post("/{payment_id}/mark-paid", response_model=PaymentResponse)
def mark_payment_paid(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the student can confirm payment")
    if payment.status != PaymentStatus.PAYMENT_PENDING.value:
        raise HTTPException(status_code=400, detail="Payment is not pending confirmation")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Associated booking not found")
    if booking.status != BookingStatus.AWAITING_PAYMENT.value:
        raise HTTPException(status_code=400, detail="Booking is not awaiting payment")

    payment.status = payment_service.markPaid({"status": payment.status})["status"]
    payment.updated_at = datetime.utcnow()
    booking.status = BookingStatus.PAID.value
    booking.status_history = (booking.status_history or []) + [
        {
            "status": BookingStatus.PAID.value,
            "changed_at": datetime.utcnow().isoformat(),
            "note": "Payment completed",
        }
    ]
    db.commit()
    db.refresh(payment)
    db.refresh(booking)

    _create_notification(
        db,
        user_id=booking.alumni_id,
        booking_id=booking.id,
        message=(
            f"Payment for booking {booking.id} has been completed by the student."
        ),
    )
    db.commit()

    return payment


@router.get("/admin/summary")
def get_admin_payment_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, "alumni", detail="Alumni only")

    total_gross = db.query(func.coalesce(func.sum(Payment.gross_amount), 0)).scalar() or Decimal("0")
    total_platform_fee = db.query(func.coalesce(func.sum(Payment.platform_fee), 0)).scalar() or Decimal("0")
    total_mentor_amount = db.query(func.coalesce(func.sum(Payment.mentor_amount), 0)).scalar() or Decimal("0")
    pending_count = db.query(Payment).filter(Payment.status == "PAYMENT_PENDING").count()
    paid_count = db.query(Payment).filter(Payment.status == "PAID").count()

    return {
        "total_gross": total_gross,
        "total_platform_fee": total_platform_fee,
        "total_mentor_amount": total_mentor_amount,
        "pending_count": pending_count,
        "paid_count": paid_count,
    }


@router.get("/me", response_model=list[PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(Payment).filter(Payment.student_id == current_user.id).all()
    return payments


@router.get("/mentor/me", response_model=list[PaymentResponse])
def get_mentor_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, "alumni", detail="Alumni only")
    payments = db.query(Payment).filter(Payment.mentor_id == current_user.id).all()
    return payments


@router.get("/payout-settings/me", response_model=PayoutSettingsResponse | None)
def get_payout_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(MentorPayoutSettings).filter(MentorPayoutSettings.mentor_id == current_user.id).first()
    return settings


@router.post("/payout-settings", response_model=PayoutSettingsResponse)
def upsert_payout_settings(payload: PayoutSettingsInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, "alumni", detail="Only alumni can configure payouts")

    settings = db.query(MentorPayoutSettings).filter(MentorPayoutSettings.mentor_id == current_user.id).first()
    if settings is None:
        settings = MentorPayoutSettings(mentor_id=current_user.id)
        db.add(settings)

    settings.method = payload.method
    settings.upi_id = payload.upi_id
    settings.account_holder = payload.account_holder
    settings.account_number = payload.account_number
    settings.ifsc = payload.ifsc
    settings.verified = "pending"
    db.commit()
    db.refresh(settings)
    return settings


@router.post("/{payment_id}/schedule-payout")
def schedule_payout(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, "alumni", detail="Alumni only")

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the mentor can schedule payout")

    payout = Payout(
        mentor_id=current_user.id,
        payment_id=payment.id,
        amount=payment.mentor_amount,
        status=PaymentStatus.PAYOUT_PENDING.value,
        scheduled_for=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(payout)
    payment.status = PaymentStatus.PAYOUT_PENDING.value
    db.commit()
    return {"message": "Payout scheduled", "status": payout.status}
