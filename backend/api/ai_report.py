from fastapi import APIRouter
from db.mongodb import db

router = APIRouter(prefix="/report", tags=["report"])

@router.get("/exam/{exam_id}/student/{student_id}")
async def generate_report(exam_id: str, student_id: str):
    logs = await db.proctor_logs.find({
        "exam_id": exam_id,
        "student_id": student_id
    }).to_list(1000)

    counts = {}
    for log in logs:
        event = log["event"]
        counts[event] = counts.get(event, 0) + 1

    summary = f"""
    Exam: {logs[0]['exam_title']}
    Student: {logs[0]['student_name']} ({logs[0]['student_email']})

    Total Warnings: {len(logs)}

    Breakdown:
    {counts}

    Timeline:
    {[log['timestamp'] for log in logs]}
    """

    return {"summary": summary}
