import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


WorkItemType = Literal["epic", "story", "task", "bug"]
WorkItemStatus = Literal["todo", "in_progress", "review", "done"]
WorkItemPriority = Literal["low", "medium", "high", "urgent"]


class WorkItemBase(BaseModel):
    type: WorkItemType
    title: str
    description: str | None = None
    status: WorkItemStatus = "todo"
    priority: WorkItemPriority = "medium"
    story_points: int | None = None
    due_date: date | None = None
    labels: list[str] = Field(default_factory=list)


class WorkItemCreate(WorkItemBase):
    parent_id: uuid.UUID | None = None
    assignee_id: uuid.UUID | None = None


class WorkItemUpdate(BaseModel):
    type: WorkItemType | None = None
    title: str | None = None
    description: str | None = None
    status: WorkItemStatus | None = None
    priority: WorkItemPriority | None = None
    story_points: int | None = None
    due_date: date | None = None
    labels: list[str] | None = None
    parent_id: uuid.UUID | None = None
    assignee_id: uuid.UUID | None = None
    board_order: int | None = None
    sprint_id: uuid.UUID | None = None


class WorkItemStatusUpdate(BaseModel):
    status: WorkItemStatus
    board_order: int


class WorkItemResponse(WorkItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    parent_id: uuid.UUID | None = None
    assignee_id: uuid.UUID | None = None
    board_order: int
    sprint_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
