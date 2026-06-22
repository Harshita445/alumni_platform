from typing import Optional

from pydantic import BaseModel


class SavedAlumniResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None

    model_config = {
        "from_attributes": True
    }