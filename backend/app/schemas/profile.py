from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    branch: Optional[str] = Field(default=None, min_length=1, max_length=80)
    graduation_year: Optional[int] = Field(default=None, ge=1900, le=2100)

    company: Optional[str] = Field(default=None, min_length=1, max_length=120)
    designation: Optional[str] = Field(default=None, min_length=1, max_length=120)

    bio: Optional[str] = Field(default=None, max_length=1000)
    linkedin_url: Optional[HttpUrl] = None


class ProfileResponse(ProfileUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(
        from_attributes=True
    )