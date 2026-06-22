from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    student_id: int
    alumni_id: int
    rating: int
    comment: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
