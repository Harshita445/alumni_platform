from typing import Optional

from pydantic import BaseModel


class SavedAlumniResponse(BaseModel):
    id: int

    full_name: Optional[str]
    company: Optional[str]
    designation: Optional[str]

    model_config = {
        "from_attributes": True
    }