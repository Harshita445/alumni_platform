from datetime import date, time
from pydantic import BaseModel


class RecentBooking(BaseModel):
    id: int
    name: str
    date: date
    time: time
    status: str

    model_config = {
        "from_attributes": True
    }


class StudentDashboardResponse(BaseModel):
    pending_requests: int
    upcoming_sessions: int
    completed_sessions: int
    saved_alumni: int

    recent_bookings: list[RecentBooking]


class AlumniDashboardResponse(BaseModel):
    pending_requests: int
    upcoming_sessions: int
    completed_sessions: int
    total_students_helped: int

    recent_bookings: list[RecentBooking]