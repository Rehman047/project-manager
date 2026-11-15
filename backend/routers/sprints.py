import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from middleware.dependencies import require_role
from models.sprint import Sprint
from models.user import User
from models.work_item import WorkItem
from schemas.sprint import SprintCreate, SprintResponse, SprintUpdate


router = APIRouter(prefix="/api/projects/{project_id}/sprints", tags=["sprints"])
velocity_router = APIRouter(prefix="/api/projects/{project_id}", tags=["sprints"])


def get_sprint_or_404(project_id: uuid.UUID, sprint_id: uuid.UUID, db: Session) -> Sprint:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id, Sprint.project_id == project_id).first()
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")
    return sprint


@router.get("", response_model=list[SprintResponse])
def list_sprints(project_id: uuid.UUID, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    return db.query(Sprint).filter(Sprint.project_id == project_id).order_by(Sprint.created_at.desc()).all()


@router.post("", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
def create_sprint(
    project_id: uuid.UUID,
    payload: SprintCreate,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    start_date = payload.start_date or date.today()
    sprint = Sprint(
        project_id=project_id,
        name=payload.name,
        goal=payload.goal,
        start_date=start_date,
        end_date=payload.end_date or start_date,
        status="planned",
        committed_points=0,
        completed_points=0,
        velocity=0,
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return sprint


@router.put("/{sprint_id}", response_model=SprintResponse)
def update_sprint(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    payload: SprintUpdate,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    sprint = get_sprint_or_404(project_id, sprint_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sprint, field, value)
    db.commit()
    db.refresh(sprint)
    return sprint


@router.post("/{sprint_id}/start", response_model=SprintResponse)
def start_sprint(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    sprint = get_sprint_or_404(project_id, sprint_id, db)
    if sprint.status == "closed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Closed sprints cannot be started")
    sprint.status = "active"
    sprint.start_date = date.today()
    sprint.committed_points = (
        db.query(func.coalesce(func.sum(WorkItem.story_points), 0))
        .filter(WorkItem.project_id == project_id, WorkItem.sprint_id == sprint_id)
        .scalar()
        or 0
    )
    db.commit()
    db.refresh(sprint)
    return sprint


@router.post("/{sprint_id}/close", response_model=SprintResponse)
def close_sprint(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    sprint = get_sprint_or_404(project_id, sprint_id, db)
    items = db.query(WorkItem).filter(WorkItem.project_id == project_id, WorkItem.sprint_id == sprint_id).all()
    sprint.completed_points = sum(item.story_points or 0 for item in items if item.status == "done")
    sprint.velocity = sprint.completed_points
    sprint.status = "closed"
    for item in items:
        if item.status != "done":
            item.sprint_id = None
    db.commit()
    db.refresh(sprint)
    return sprint


@router.get("/{sprint_id}/burndown")
def get_burndown(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    _: User = Depends(require_role("viewer")),
    db: Session = Depends(get_db),
):
    sprint = get_sprint_or_404(project_id, sprint_id, db)
    if sprint.start_date is None:
        return []
    today = date.today()
    end_date = min(today, sprint.end_date or today)
    remaining = (
        db.query(func.coalesce(func.sum(WorkItem.story_points), 0))
        .filter(
            WorkItem.project_id == project_id,
            WorkItem.sprint_id == sprint_id,
            WorkItem.status != "done",
        )
        .scalar()
        or 0
    )
    days = []
    current = sprint.start_date
    while current <= end_date:
        days.append({"date": current.isoformat(), "remaining_points": remaining})
        current += timedelta(days=1)
    return days


@velocity_router.get("/velocity")
def get_velocity(project_id: uuid.UUID, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    return [
        {"name": sprint.name, "velocity": sprint.velocity or 0}
        for sprint in db.query(Sprint)
        .filter(Sprint.project_id == project_id, Sprint.status == "closed")
        .order_by(Sprint.end_date.desc())
        .limit(5)
        .all()
    ][::-1]
