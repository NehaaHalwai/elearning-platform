from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role: Literal["student", "instructor", "admin"] = "student"

class User(BaseModel):
    email: EmailStr
    username: str
    hashed_password: str
    full_name: Optional[str] = None
    role: Literal["student", "instructor", "admin"] = "student"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()