import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.dependencies import require_role
from models.sprint import Sprint
from models.user import User
from models.work_item import WorkItem
from schemas.work_item import WorkItemResponse, WorkItemStatusUpdate


router = APIRouter(prefix="/api/projects/{project_id}", tags=["board"])
STATUSES = ("todo", "in_progress", "review", "done")


@router.get("/board")
def get_board(project_id: uuid.UUID, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    active_sprint = db.query(Sprint).filter(Sprint.project_id == project_id, Sprint.status == "active").first()
    board = {board_status: [] for board_status in STATUSES}
    if active_sprint is None:
        return board
    items = (
        db.query(WorkItem)
        .filter(WorkItem.project_id == project_id, WorkItem.sprint_id == active_sprint.id)
        .order_by(WorkItem.board_order)
        .all()
    )
    for item in items:
        if item.status in board:
            board[item.status].append(WorkItemResponse.model_validate(item).model_dump(mode="json"))
    return board


@router.patch("/items/{item_id}/status", response_model=WorkItemResponse)
def update_status(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: WorkItemStatusUpdate,
    _: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    item = db.query(WorkItem).filter(WorkItem.id == item_id, WorkItem.project_id == project_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work item not found")
    item.status = payload.status
    item.board_order = payload.board_order
    db.commit()
    db.refresh(item)
    return item
