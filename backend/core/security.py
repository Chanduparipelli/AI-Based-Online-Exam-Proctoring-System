from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: int | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=(expires_delta or settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_token(token: str):
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
