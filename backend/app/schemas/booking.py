from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BookingCreate(BaseModel):
    alumni_id: int
    session_type: str = Field(min_length=1, max_length=80)
    date: str
    time: str

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str):
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("date must use YYYY-MM-DD format") from exc

        return value

    @field_validator("time")
    @classmethod
    def validate_time(cls, value: str):
        try:
            datetime.strptime(value, "%H:%M")
        except ValueError as exc:
            raise ValueError("time must use HH:MM format") from exc

        return value


class BookingResponse(BaseModel):
    id: int
    student_id: int
    alumni_id: int
    session_type: str
    date: str
    time: str
    status: str
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
