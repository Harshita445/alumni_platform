from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MentorshipServiceCreate(BaseModel):
    alumni_id: int = Field(gt=0)
    service_type: str = Field(min_length=1, max_length=80)
    price: Optional[Decimal] = None
    is_enabled: bool = True
    currency: Optional[str] = "INR"

    @field_validator("price")
    @classmethod
    def validate_price(cls, value):
        if value is None:
            return value
        if value < Decimal("99") or value > Decimal("10000"):
            raise ValueError("price must be between ₹99 and ₹10,000")
        return value


class MentorshipServiceResponse(BaseModel):
    id: int
    alumni_id: int
    service_type: str
    price: Optional[Decimal] = None
    is_enabled: bool
    currency: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
