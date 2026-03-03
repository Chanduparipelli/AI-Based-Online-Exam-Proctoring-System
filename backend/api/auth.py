from fastapi import APIRouter, HTTPException
from models.user import UserCreate
from models.auth import LoginRequest
from db.mongodb import db
from core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "email": payload.email,
        "username": payload.username,
        "hashed_password": hash_password(payload.password),
        "role": payload.role.lower(),
    }

    res = await db.users.insert_one(doc)
    return {
        "id": str(res.inserted_id),
        "email": payload.email,
        "role": payload.role.lower()
    }

@router.post("/login")
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": str(user["_id"])
    }
