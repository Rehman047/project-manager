import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from middleware.dependencies import require_role
from models.project_member import ProjectMember
from models.user import User
from schemas.project import ProjectMemberResponse


router = APIRouter(prefix="/api/projects/{project_id}/members", tags=["members"])


class MemberCreate(BaseModel):
    email: str
    role: str = Field(default="member", pattern="^(admin|pm|member|viewer)$")


@router.get("", response_model=list[ProjectMemberResponse])
def list_members(project_id: uuid.UUID, _: User = Depends(require_role("viewer")), db: Session = Depends(get_db)):
    memberships = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    return [
        ProjectMemberResponse(user_id=item.user_id, project_id=item.project_id, role=item.role, user_name=item.user.name)
        for item in memberships
    ]


@router.post("", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: uuid.UUID,
    payload: MemberCreate,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id, ProjectMember.user_id == user.id
    ).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a project member")
    membership = ProjectMember(project_id=project_id, user_id=user.id, role=payload.role)
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return ProjectMemberResponse(
        user_id=membership.user_id, project_id=membership.project_id, role=membership.role, user_name=user.name
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    _: User = Depends(require_role("pm")),
    db: Session = Depends(get_db),
):
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id, ProjectMember.user_id == user_id
    ).first()
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project member not found")
    db.delete(membership)
    db.commit()
