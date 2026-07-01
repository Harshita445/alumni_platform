from datetime import date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AvailabilityCreate(BaseModel):
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6)
    date: Optional[date] = None
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_slot(self):
        if (self.day_of_week is None) == (self.date is None):
            raise ValueError("Provide exactly one of day_of_week or date.")

        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time.")

        return self


class AvailabilityResponse(BaseModel):
    id: int
    alumni_id: int
    day_of_week: Optional[int] = None
    date: Optional[date] = None
    start_time: time
    end_time: time

    model_config = ConfigDict(from_attributes=True)
