from fastapi import APIRouter, Depends, HTTPException
from typing import List
from db.mongodb import db
from models.exam import ExamCreate, ExamInDB
from core.security import decode_token
from fastapi import Header

router = APIRouter(prefix="/exams", tags=["exams"])

async def get_current_user(authorization: str = Header(...)):
    token = authorization.split("Bearer ")[-1]
    try:
        payload = decode_token(token)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=dict)
async def create_exam(payload: ExamCreate, user=Depends(get_current_user)):
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create exams")
    doc = payload.dict()
    doc["owner_id"] = user["sub"]
    res = await db.exams.insert_one(doc)
    return {"id": str(res.inserted_id)}

@router.get("/", response_model=List[dict])
async def list_exams():
    items = []
    cursor = db.exams.find({})
    async for d in cursor:
        d["id"] = str(d["_id"])
        items.append(d)
    return items
