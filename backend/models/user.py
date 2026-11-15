from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import TimestampedUUIDBase


class User(TimestampedUUIDBase):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    projects = relationship("Project", back_populates="owner")
    memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
