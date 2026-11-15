import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import TimestampedUUIDBase


class ProjectMember(TimestampedUUIDBase):
    __tablename__ = "project_members"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="member")

    user = relationship("User", back_populates="memberships")
    project = relationship("Project", back_populates="members")
