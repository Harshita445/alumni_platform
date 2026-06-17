from typing import Optional

from pydantic import BaseModel


class AlumniResponse(BaseModel):
    id: int

    full_name: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[int]

    company: Optional[str]
    designation: Optional[str]

    bio: Optional[str]
    linkedin_url: Optional[str]

    model_config = {
        "from_attributes": True
    }