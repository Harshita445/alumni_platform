from fastapi import HTTPException, status

from app.models.user import User


def require_role(user: User, role: str, detail: str | None = None) -> User:
    if user.role != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail or f"Only {role} accounts can perform this action.",
        )
    return user


def ensure_booking_participant(booking, user: User, detail: str | None = None) -> None:
    if booking.student_id != user.id and booking.alumni_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail or "Not authorized to access this booking.",
        )
