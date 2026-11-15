import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    ai_enabled: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    ai_enabled: bool | None = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime


class ProjectMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    project_id: uuid.UUID
    role: str
    user_name: str = Field(validation_alias="name")
