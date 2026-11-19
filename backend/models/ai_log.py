import uuid

from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import TimestampedUUIDBase


class AILog(TimestampedUUIDBase):
    __tablename__ = "ai_logs"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    feature: Mapped[str] = mapped_column(String, index=True, nullable=False)
    prompt_hash: Mapped[str] = mapped_column(String, index=True, nullable=False)
    response_json: Mapped[dict] = mapped_column(JSON, nullable=False)
