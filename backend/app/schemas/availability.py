from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AvailabilityCreate(BaseModel):
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    date: date | None = None
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
    day_of_week: int | None = None
    date: date | None = None
    start_time: time
    end_time: time

    model_config = ConfigDict(from_attributes=True)
