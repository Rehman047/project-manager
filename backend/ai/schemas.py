import uuid
from typing import Literal
from pydantic import BaseModel, Field

ItemType = Literal["epic", "story", "task", "bug"]
Priority = Literal["low", "medium", "high", "urgent"]
Source = Literal["gemini", "fallback", "cache"]

class AITaskCreateRequest(BaseModel):
    prompt: str = Field(min_length=1)
class AITaskCreateResponse(BaseModel):
    title: str
    description: str
    type: ItemType
    priority: Priority
    story_points: int = Field(ge=1)
    labels: list[str]
    source: Source
class AIBreakdownRequest(BaseModel):
    work_item_id: uuid.UUID
class AIBreakdownItem(BaseModel):
    title: str
    description: str
    type: ItemType
    priority: Priority
    story_points: int = Field(ge=1)
    labels: list[str]
class AIBreakdownResponse(BaseModel):
    parent_id: uuid.UUID
    items: list[AIBreakdownItem]
    source: Source
class AISprintPlanRequest(BaseModel):
    capacity_points: int = Field(gt=0)
    sprint_id: uuid.UUID | None = None
class AISprintSuggestionItem(BaseModel):
    work_item_id: uuid.UUID
    title: str
    story_points: int
    priority: Priority
    reason: str
class AISprintPlanResponse(BaseModel):
    recommended_items: list[AISprintSuggestionItem]
    total_points: int
    rationale: str
    source: Source
class AIRiskRequest(BaseModel):
    sprint_id: uuid.UUID | None = None
class AIRiskFlag(BaseModel):
    severity: Literal["low", "medium", "high"]
    category: str
    title: str
    description: str
    affected_item_ids: list[uuid.UUID]
    mitigation: str
class AIRiskResponse(BaseModel):
    risks: list[AIRiskFlag]
    health_score: int = Field(ge=0, le=100)
    source: Source
class AISummaryRequest(BaseModel):
    sprint_id: uuid.UUID | None = None
    days: int = Field(default=7, ge=1)
class AISummaryResponse(BaseModel):
    headline: str
    completed_highlights: list[str]
    in_progress_highlights: list[str]
    blockers: list[str]
    standup_markdown: str
    source: Source
