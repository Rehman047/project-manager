import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class SprintBase(BaseModel):
    name: str
    goal: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class SprintCreate(SprintBase):
    pass


class SprintUpdate(SprintBase):
    status: str | None = None


class SprintResponse(SprintBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    status: str
    committed_points: int
    completed_points: int
    velocity: float | None = None
    created_at: datetime
