from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, user_id: int, message: str, booking_id: int | None = None) -> Notification:
        notification = Notification(
            user_id=user_id,
            booking_id=booking_id,
            message=message,
        )
        self.db.add(notification)
        self.db.flush()
        return notification

    def list_for_user(self, user_id: int):
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    def mark_read(self, notification_id: int, user_id: int) -> Notification:
        notification = (
            self.db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if notification is None:
            raise ValueError("Notification not found")
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification
