import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, Path, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.project_member import ProjectMember
from models.user import User
from services.auth_service import ALGORITHM


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if not subject:
            raise credentials_exception
        user_id = uuid.UUID(subject)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


ROLE_LEVELS = {"viewer": 1, "member": 2, "pm": 3, "admin": 4}


def require_role(min_role: str) -> Callable:
    if min_role not in ROLE_LEVELS:
        raise ValueError(f"Unknown role: {min_role}")

    def role_dependency(
        current_user: User = Depends(get_current_user),
        project_id: uuid.UUID = Path(...),
        db: Session = Depends(get_db),
    ) -> User:
        membership = (
            db.query(ProjectMember)
            .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id)
            .first()
        )
        if membership is None or ROLE_LEVELS.get(membership.role, 0) < ROLE_LEVELS[min_role]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient project role")
        return current_user

    return role_dependency
