import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID
    type: str
    message: str
    reference_id: uuid.UUID | None
    read: bool
    created_at: datetime

class UnreadCountResponse(BaseModel):
    unread_count: int
