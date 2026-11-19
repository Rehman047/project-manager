import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from middleware.dependencies import require_role
from models.user import User
from models.project_member import ProjectMember
from models.work_item import WorkItem
from models.comment import Comment
from schemas.comment import CommentCreate, CommentResponse
from services.notification_service import create_notification
from middleware.dependencies import get_current_user
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
    current_user: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    max_order = (
        db.query(func.max(WorkItem.board_order))
        .filter(WorkItem.project_id == project_id, WorkItem.status == "todo")
        .scalar()
    )
    item = WorkItem(
        project_id=project_id,
        **payload.model_dump(),
        board_order=(max_order + 1 if max_order is not None else 0),
    )
    db.add(item)
    if item.assignee_id and item.assignee_id != current_user.id:
        create_notification(db, item.assignee_id, project_id, "assignment",
                            f"You were assigned to {item.title}", item.id)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=WorkItemResponse)
def update_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: WorkItemUpdate,
    current_user: User = Depends(require_role("member")),
    db: Session = Depends(get_db),
):
    item = get_item_or_404(project_id, item_id, db)
    previous_assignee = item.assignee_id
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    if item.assignee_id and item.assignee_id != previous_assignee and item.assignee_id != current_user.id:
        create_notification(db, item.assignee_id, project_id, "assignment",
                            f"You were assigned to {item.title}", item.id)
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


@router.get("/{item_id}/comments", response_model=list[CommentResponse])
def list_comments(project_id: uuid.UUID, item_id: uuid.UUID, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    get_item_or_404(project_id, item_id, db)
    comments = db.query(Comment).filter(Comment.work_item_id == item_id).order_by(Comment.created_at.asc()).all()
    return [CommentResponse.model_validate({**c.__dict__, "author_name": c.author.name}) for c in comments]


@router.post("/{item_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(project_id: uuid.UUID, item_id: uuid.UUID, payload: CommentCreate,
                current_user: User = Depends(require_role("member")), db: Session = Depends(get_db)):
    item = get_item_or_404(project_id, item_id, db)
    comment = Comment(work_item_id=item.id, author_id=current_user.id, body=payload.body)
    db.add(comment)
    if item.assignee_id and item.assignee_id != current_user.id:
        create_notification(db, item.assignee_id, project_id, "comment", f"{current_user.name} commented on {item.title}", item.id)
    db.commit()
    db.refresh(comment)
    return CommentResponse.model_validate({**comment.__dict__, "author_name": current_user.name})


@router.delete("/{item_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(project_id: uuid.UUID, item_id: uuid.UUID, comment_id: uuid.UUID,
                   current_user: User = Depends(require_role("member")), db: Session = Depends(get_db)):
    item = get_item_or_404(project_id, item_id, db)
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.work_item_id == item.id).first()
    if comment is None:
        raise HTTPException(404, "Comment not found")
    membership = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id).first()
    if comment.author_id != current_user.id and (membership is None or membership.role not in ("pm", "admin")):
        raise HTTPException(403, "Only the author or project manager can delete comments")
    db.delete(comment)
    db.commit()
