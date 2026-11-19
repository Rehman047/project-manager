import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from middleware.dependencies import require_role
from models.project import Project
from models.user import User
from models.work_item import WorkItem
from ai.fallback_service import FallbackAIService
from ai.schemas import *

router = APIRouter(prefix="/api/projects/{project_id}/ai", tags=["ai"])

def _enabled(project_id, db):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    if not project.ai_enabled:
        raise HTTPException(403, "AI is disabled for this project")

@router.post("/create-task", response_model=AITaskCreateResponse)
def create_task(project_id: uuid.UUID, payload: AITaskCreateRequest, _: User = Depends(require_role("member")), db: Session = Depends(get_db)):
    _enabled(project_id, db)
    return FallbackAIService().create_task(payload.prompt)

@router.post("/breakdown-epic", response_model=AIBreakdownResponse)
def breakdown_epic(project_id: uuid.UUID, payload: AIBreakdownRequest, _: User = Depends(require_role("member")), db: Session = Depends(get_db)):
    _enabled(project_id, db)
    item = db.query(WorkItem).filter(WorkItem.id == payload.work_item_id, WorkItem.project_id == project_id).first()
    if not item: raise HTTPException(404, "Work item not found")
    return FallbackAIService().breakdown_epic(item)

@router.post("/plan-sprint", response_model=AISprintPlanResponse)
def plan_sprint(project_id: uuid.UUID, payload: AISprintPlanRequest, _: User = Depends(require_role("pm")), db: Session = Depends(get_db)):
    _enabled(project_id, db)
    items = db.query(WorkItem).filter(WorkItem.project_id == project_id, WorkItem.sprint_id.is_(None), WorkItem.status != "done").all()
    return FallbackAIService().plan_sprint(items, payload.capacity_points)

@router.post("/detect-risks", response_model=AIRiskResponse)
def detect_risks(project_id: uuid.UUID, payload: AIRiskRequest, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    _enabled(project_id, db)
    items = db.query(WorkItem).filter(WorkItem.project_id == project_id).all()
    return FallbackAIService().detect_risks(items)

@router.post("/summary", response_model=AISummaryResponse)
def summary(project_id: uuid.UUID, payload: AISummaryRequest, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    _enabled(project_id, db)
    items = db.query(WorkItem).filter(WorkItem.project_id == project_id).all()
    return FallbackAIService().generate_summary(items)
