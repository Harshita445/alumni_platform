from sqlalchemy import CheckConstraint, Column, Date, ForeignKey, Integer, Time
from sqlalchemy.orm import relationship

from app.database import Base


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    alumni_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=True)
    date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    alumni = relationship(
        "User",
        foreign_keys=[alumni_id],
        backref="availability_slots",
    )

    __table_args__ = (
        CheckConstraint(
            "(day_of_week IS NOT NULL AND date IS NULL) "
            "OR (day_of_week IS NULL AND date IS NOT NULL)",
            name="ck_availability_day_or_date",
        ),
        CheckConstraint(
            "day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)",
            name="ck_availability_day_of_week_range",
        ),
        CheckConstraint(
            "start_time < end_time",
            name="ck_availability_time_order",
        ),
    )
