from decimal import Decimal

from app.core.payment_config import PLATFORM_FEE_PERCENT
from app.services.payment_gateway import DummyPaymentGateway
from app.services.payment_service import PaymentService


def test_platform_fee_and_mentor_amount_use_shared_constant():
    service = PaymentService()

    gross_amount = 500
    platform_fee = service.calculatePlatformFee(gross_amount)
    mentor_amount = service.calculateMentorAmount(gross_amount)

    assert platform_fee == 50
    assert mentor_amount == 450
    assert platform_fee == gross_amount * PLATFORM_FEE_PERCENT / 100


def test_payment_service_marks_payment_statuses():
    service = PaymentService()

    payment = service.createPayment(booking_id=7, student_id=1, mentor_id=2, gross_amount=299)

    assert payment["status"] == "PAYMENT_PENDING"
    assert payment["platform_fee"] == Decimal("29.9")
    assert payment["mentor_amount"] == Decimal("269.1")

    paid_payment = service.markPaid(payment)
    assert paid_payment["status"] == "PAID"

    scheduled = service.schedulePayout(paid_payment)
    assert scheduled["payout_status"] == "PAYOUT_PENDING"


def test_payment_service_uses_gateway_for_checkout_metadata():
    gateway = DummyPaymentGateway()
    service = PaymentService(gateway=gateway)

    payment = service.createPayment(booking_id=9, student_id=3, mentor_id=4, gross_amount=499)

    assert payment["gateway"] == "dummy"
    assert payment["gateway_order_id"].startswith("dummy-order-")
    assert payment["checkout_url"].startswith("/payments/checkout/dummy")
