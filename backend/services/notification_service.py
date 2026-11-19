import uuid
from sqlalchemy.orm import Session
from models.notification import Notification

def create_notification(db: Session, user_id: uuid.UUID, project_id: uuid.UUID, type: str, message: str,
                        reference_id: uuid.UUID | None = None) -> Notification:
    notification = Notification(user_id=user_id, project_id=project_id, type=type, message=message, reference_id=reference_id)
    db.add(notification)
    db.flush()
    return notification

def get_user_notifications(db: Session, user_id: uuid.UUID, unread_only: bool = False) -> list[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.read.is_(False))
    return query.order_by(Notification.created_at.desc()).all()

def mark_as_read(db: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification | None:
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notification:
        notification.read = True
        db.commit()
        db.refresh(notification)
    return notification

def mark_all_as_read(db: Session, user_id: uuid.UUID) -> int:
    count = db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).update(
        {Notification.read: True}, synchronize_session=False
    )
    db.commit()
    return count
