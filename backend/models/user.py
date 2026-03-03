from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: str = Field(..., description="student or teacher")

class UserInDB(BaseModel):
    id: Optional[str]
    email: EmailStr
    username: str
    hashed_password: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
