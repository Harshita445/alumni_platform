from datetime import datetime, date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BookingCreate(BaseModel):
    alumni_id: int = Field(gt=0)
    session_type: str = Field(min_length=1, max_length=80)
    date: date
    time: time
    message: Optional[str] = None

    @field_validator("date", mode="before")
    @classmethod
    def validate_date(cls, value):
        if isinstance(value, str):
            try:
                return datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError as exc:
                raise ValueError("date must use YYYY-MM-DD format") from exc
        return value

    @field_validator("time", mode="before")
    @classmethod
    def validate_time(cls, value):
        if isinstance(value, str):
            try:
                return datetime.strptime(value, "%H:%M").time()
            except ValueError as exc:
                raise ValueError("time must use HH:MM format") from exc
        return value


class BookingResponse(BaseModel):
    id: int
    student_id: int
    alumni_id: int
    session_type: str
    date: date
    time: time
    status: str
    message: Optional[str] = None
    timezone: Optional[str] = None
    meeting_link: Optional[str] = None
    payment_id: Optional[int] = None
    payment_status: Optional[str] = None
    payment_gateway: Optional[str] = None
    status_history: Optional[list[dict]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
