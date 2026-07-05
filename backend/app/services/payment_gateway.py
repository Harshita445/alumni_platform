from abc import ABC, abstractmethod
from decimal import Decimal


class PaymentGateway(ABC):
    name: str = "" 

    @abstractmethod
    def create_order(self, payment_payload: dict) -> dict:
        raise NotImplementedError


class DummyPaymentGateway(PaymentGateway):
    name = "dummy"

    def create_order(self, payment_payload: dict) -> dict:
        booking_id = payment_payload["booking_id"]
        gross_amount = payment_payload["gross_amount"]
        return {
            "order_id": f"dummy-order-{booking_id}",
            "amount": Decimal(str(gross_amount)),
            "currency": payment_payload["currency"],
            "checkout_url": f"/payments/checkout/{self.name}/{booking_id}",
        }


class RazorpayPaymentGateway(PaymentGateway):
    name = "razorpay"

    def create_order(self, payment_payload: dict) -> dict:
        return {
            "order_id": f"razorpay-order-{payment_payload['booking_id']}",
            "amount": Decimal(str(payment_payload["gross_amount"])),
            "currency": payment_payload["currency"],
            "checkout_url": f"/payments/checkout/{self.name}/{payment_payload['booking_id']}",
        }
