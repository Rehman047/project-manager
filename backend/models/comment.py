from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import TimestampedUUIDBase


class Comment(TimestampedUUIDBase):
    __tablename__ = "comments"

    work_item_id: Mapped[object] = mapped_column(UUID(as_uuid=True), ForeignKey("work_items.id", ondelete="CASCADE"), nullable=False)
    author_id: Mapped[object] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    work_item = relationship("WorkItem", back_populates="comments")
    author = relationship("User", back_populates="comments")
