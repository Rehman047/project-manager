import uuid
from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import TimestampedUUIDBase


class Sprint(TimestampedUUIDBase):
    __tablename__ = "sprints"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    goal: Mapped[str | None] = mapped_column(Text)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="planned")
    committed_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    velocity: Mapped[float] = mapped_column(Float, nullable=False, default=0)
