import uuid
from sqlalchemy.orm import Session
from models.project import Project
from models.project_member import ProjectMember

def get_project(db: Session, project_id: uuid.UUID) -> Project | None:
    return db.get(Project, project_id)

def is_project_member(db: Session, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id).first() is not None
