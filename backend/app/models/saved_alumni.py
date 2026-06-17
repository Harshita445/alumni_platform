from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class SavedAlumni(Base):
    __tablename__ = "saved_alumni"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    alumni_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "alumni_id",
            name="unique_saved_alumni",
        ),
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
    )

    alumni = relationship(
        "User",
        foreign_keys=[alumni_id],
    )