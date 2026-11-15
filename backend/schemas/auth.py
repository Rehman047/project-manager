from pydantic import BaseModel, EmailStr

from schemas.user import UserResponse


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserResponse
