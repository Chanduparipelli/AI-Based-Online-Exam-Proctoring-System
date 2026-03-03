from fastapi import APIRouter
from db.mongodb import db
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["logs"])

@router.post("/add")
async def add_log(data: dict):
    data["timestamp"] = datetime.utcnow().isoformat()
    res = await db.proctor_logs.insert_one(data)
    return {"log_id": str(res.inserted_id)}
