import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CommentCreate(BaseModel):
    body: str

class CommentUpdate(BaseModel):
    body: str

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    work_item_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str | None = None
    body: str
    created_at: datetime
    updated_at: datetime
