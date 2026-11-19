import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from middleware.dependencies import get_current_user
from models.notification import Notification
from models.user import User
from schemas.notification import NotificationResponse, UnreadCountResponse
from services.notification_service import get_user_notifications, mark_all_as_read, mark_as_read

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=list[NotificationResponse])
def list_notifications(unread_only: bool = Query(False), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_notifications(db, user.id, unread_only)

@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"unread_count": len(get_user_notifications(db, user.id, True))}

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(notification_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = mark_as_read(db, notification_id, user.id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.patch("/read-all")
def read_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"updated": mark_all_as_read(db, user.id)}
