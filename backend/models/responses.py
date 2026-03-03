from pydantic import BaseModel
from typing import Optional, Any

class Message(BaseModel):
    detail: str

class IDResponse(BaseModel):
    id: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class GenericSuccess(BaseModel):
    ok: bool = True
    data: Optional[Any] = None
