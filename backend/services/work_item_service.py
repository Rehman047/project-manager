from sqlalchemy.orm import Session
from models.work_item import WorkItem

def list_backlog(db: Session, project_id, item_status: str | None = None):
    query = db.query(WorkItem).filter(WorkItem.project_id == project_id, WorkItem.sprint_id.is_(None))
    return query.filter(WorkItem.status == item_status).all() if item_status else query.all()
