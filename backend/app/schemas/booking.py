from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    alumni_id: int
    session_type: str
    date: str
    time: str


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
