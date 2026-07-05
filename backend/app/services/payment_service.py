from decimal import Decimal

from app.core.payment_config import PLATFORM_FEE_PERCENT
from app.services.payment_gateway import DummyPaymentGateway, PaymentGateway


class PaymentService:
    def __init__(self, gateway: PaymentGateway | None = None):
        self.gateway = gateway or DummyPaymentGateway()
    def calculatePlatformFee(self, gross_amount: int | float | Decimal) -> Decimal:
        gross = Decimal(str(gross_amount))
        return (gross * Decimal(PLATFORM_FEE_PERCENT)) / Decimal(100)

    def calculateMentorAmount(self, gross_amount: int | float | Decimal) -> Decimal:
        gross = Decimal(str(gross_amount))
        return gross - self.calculatePlatformFee(gross)

    def createPayment(self, booking_id: int, student_id: int, mentor_id: int, gross_amount: int | float | Decimal) -> dict:
        gross = Decimal(str(gross_amount))
        platform_fee = self.calculatePlatformFee(gross)
        mentor_amount = self.calculateMentorAmount(gross)
        payment_payload = {
            "booking_id": booking_id,
            "student_id": student_id,
            "mentor_id": mentor_id,
            "gross_amount": gross,
            "platform_fee": platform_fee,
            "mentor_amount": mentor_amount,
            "currency": "INR",
            "status": "PAYMENT_PENDING",
        }
        gateway_details = self.gateway.create_order(payment_payload)
        payment_payload.update({
            "gateway": self.gateway.name,
            "gateway_order_id": gateway_details["order_id"],
            "checkout_url": gateway_details["checkout_url"],
        })
        return payment_payload

    def markPaid(self, payment: dict) -> dict:
        payment["status"] = "PAID"
        return payment

    def schedulePayout(self, payment: dict) -> dict:
        return {
            **payment,
            "payout_status": "PAYOUT_PENDING",
            "scheduled_for": "24h",
        }

    def releasePayout(self, payout: dict) -> dict:
        payout["payout_status"] = "READY_FOR_TRANSFER"
        return payout

    def refundPayment(self, payment: dict) -> dict:
        payment["status"] = "REFUNDED"
        return payment
