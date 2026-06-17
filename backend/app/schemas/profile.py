from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None

    company: Optional[str] = None
    designation: Optional[str] = None

    bio: Optional[str] = None
    linkedin_url: Optional[str] = None


class ProfileResponse(ProfileUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(
        from_attributes=True
    )