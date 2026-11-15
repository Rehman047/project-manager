import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.dependencies import require_role
from models.user import User
from models.work_item import WorkItem
from schemas.work_item import WorkItemCreate, WorkItemResponse, WorkItemUpdate


router = APIRouter(prefix="/api/projects/{project_id}/items", tags=["work-items"])


def get_item_or_404(project_id: uuid.UUID, item_id: uuid.UUID, db: Session) -> WorkItem:
    item = db.query(WorkItem).filter(WorkItem.id == item_id, WorkItem.project_id == project_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work item not found")
    return item


@router.get("", response_model=list[WorkItemResponse])
def list_items(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID | None = Query(default=None),
    item_status: str | None = Query(default=None, alias="status"),
    _: User = Depends(require_role("viewer")),
    db: Session = Depends(get_db),
):
    query = db.query(WorkItem).filter(WorkItem.project_id == project_id)
    if sprint_id is not None:
        query = query.filter(WorkItem.sprint_id == sprint_id)
    if item_status is not None:
        query = query.filter(WorkItem.status == item_status)
    return query.order_by(WorkItem.board_order, WorkItem.created_at).all()


@router.post("", response_model=WorkItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    project_id: uuid.UUID,
    payload: WorkItemCreate,
    _: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    max_order = (
        db.query(WorkItem.board_order)
        .filter(WorkItem.project_id == project_id, WorkItem.status == "todo")
        .order_by(WorkItem.board_order.desc())
        .scalar()
    )
    item = WorkItem(
        project_id=project_id,
        **payload.model_dump(),
        board_order=(max_order + 1 if max_order is not None else 0),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=WorkItemResponse)
def update_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: WorkItemUpdate,
    _: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    item = get_item_or_404(project_id, item_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    _: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    item = get_item_or_404(project_id, item_id, db)
    db.delete(item)
    db.commit()
