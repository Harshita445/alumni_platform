from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PayoutSettingsInput(BaseModel):
    method: str = Field(default="UPI")
    upi_id: Optional[str] = None
    account_holder: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None


class PayoutSettingsResponse(BaseModel):
    id: int
    mentor_id: int
    method: str
    upi_id: Optional[str] = None
    account_holder: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    beneficiary_id: Optional[str] = None
    verified: str

    model_config = ConfigDict(from_attributes=True)


class PaymentCreateInput(BaseModel):
    booking_id: int = Field(gt=0)


class PaymentResponse(BaseModel):
    id: Optional[int] = None
    booking_id: int
    student_id: int
    mentor_id: int
    gross_amount: Decimal
    platform_fee: Decimal
    mentor_amount: Decimal
    currency: str
    status: str

    model_config = ConfigDict(from_attributes=True)
