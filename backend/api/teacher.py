from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Body
from typing import Optional, Dict, Any
from db.mongodb import db
import datetime
import pdfplumber
import os
import json
import requests
from bson import ObjectId
import re

router = APIRouter(prefix="/teacher", tags=["teacher"])

try:
    from core.auth import get_current_user
except Exception:
    def get_current_user():
        return None


def _now_iso():
    return datetime.datetime.utcnow().isoformat()


def _extract_user_id(current_user: Optional[Dict[str, Any]]):
    if not current_user:
        return None
    if isinstance(current_user, dict):
        return str(
            current_user.get("id")
            or current_user.get("sub")
            or current_user.get("_id")
        )
    return None


# ---------------- UPLOAD PDF ----------------
@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    extracted_text = ""
    try:
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + " "
    except:
        content = await file.read()
        extracted_text = content.decode("utf-8", errors="ignore")

    extracted_text = " ".join(extracted_text.split())[:5000]
    return {"text": extracted_text}


# ---------------- AI GENERATE QUESTIONS ----------------
@router.post("/ai-generate-from-pdf")
async def ai_generate_from_pdf(
    exam_type: str = Form(...),
    count: int = Form(10),
    file: UploadFile = File(...)
):
    syllabus_text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                syllabus_text += text + " "

    syllabus_text = " ".join(syllabus_text.split())[:5000]

    if exam_type == "mcq":
        prompt = f"""
Generate exactly {count} multiple choice questions.
Return ONLY JSON array.
[{{"question":"","options":["","","",""],"correct":0}}]
Syllabus:{syllabus_text}
"""
    elif exam_type == "descriptive":
        prompt = f"""
Generate exactly {count} descriptive questions.
Return ONLY JSON array.
[{{"question":""}}]
Syllabus:{syllabus_text}
"""
    else:
        prompt = f"""
Generate exactly {count} coding questions.
Return ONLY JSON array.
[{{"question":"","input":"","output":""}}]
Syllabus:{syllabus_text}
"""

    api_key = os.getenv("GROQ_API_KEY")
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    raw = r.json()["choices"][0]["message"]["content"]
    raw = raw.split("```")[1] if "```" in raw else raw
    questions = json.loads(raw[raw.find("["): raw.rfind("]") + 1])
    return {"questions": questions}


# ---------------- CREATE EXAM ----------------
@router.post("/create-exam")
async def create_exam(payload: Dict, current_user: Optional[Dict] = Depends(get_current_user)):
    teacher_id = _extract_user_id(current_user)

    exam_res = await db.exams.insert_one({
        "title": payload.get("title"),
        "subject": payload.get("subject"),
        "type": payload.get("type"),
        "total_marks": payload.get("total_marks"),
        "duration": payload.get("duration"),
        "teacher_id": teacher_id,
        "created_at": _now_iso()
    })

    exam_id = str(exam_res.inserted_id)
    docs = []

    for q in payload.get("questions", []):
        docs.append({
            "exam_id": exam_id,
            "type": payload.get("type"),
            "question": q.get("question"),
            "options": q.get("options") or [],
            "correct_answer": q.get("correct"),
            "input": q.get("input"),
            "output": q.get("output"),
            "teacher_id": teacher_id,
            "created_at": _now_iso()
        })

    if docs:
        await db.questions.insert_many(docs)

    return {"exam_id": exam_id}


# ---------------- GET EXAMS ----------------
@router.get("/exams")
async def get_exams(current_user: Optional[Dict] = Depends(get_current_user)):
    teacher_id = _extract_user_id(current_user)
    exams = await db.exams.find({"teacher_id": teacher_id}).to_list(1000)
    for e in exams:
        e["_id"] = str(e["_id"])
    return exams


# ---------------- LIST SUBMISSIONS ----------------
@router.get("/submissions")
async def list_submissions():
    subs = await db.submissions.find().sort("submitted_at", -1).to_list(1000)
    for s in subs:
        s["_id"] = str(s["_id"])
    return subs


# ---------------- SUBMISSION DETAIL (FIXED) ----------------
@router.get("/submissions/{submission_id}")
async def get_submission_detail(submission_id: str):
    sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub["_id"] = str(sub["_id"])
    exam_id = str(sub.get("exam_id"))
    student_id = str(sub.get("student_id"))

    answers = sub.get("answers", {})
    qdocs = await db.questions.find({"exam_id": exam_id}).to_list(500)

    questions = []
    for q in qdocs:
        qid = str(q["_id"])
        questions.append({
            "question_id": qid,
            "question": q.get("question"),
            "type": q.get("type"),
            "options": q.get("options"),
            "student_answer": answers.get(qid, "")
        })

    cheating_logs = await db.proctor_logs.find({
        "exam_id": exam_id,
        "student_id": student_id
    }).sort("timestamp", 1).to_list(1000)

    for c in cheating_logs:
        c["_id"] = str(c["_id"])

    return {
        "submission": sub,
        "questions": questions,
        "cheating_logs": cheating_logs
    }


# ---------------- MANUAL EVALUATE ----------------
@router.post("/submissions/{submission_id}/evaluate")
async def evaluate_submission(submission_id: str, data: Dict):
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "score": data.get("score"),
            "total": data.get("total"),
            "evaluated": True,
            "evaluated_at": _now_iso()
        }}
    )
    return {"message": "ok"}


# ---------------- AI EVALUATE ----------------
@router.post("/ai-evaluate/{submission_id}")
async def ai_evaluate(submission_id: str, data: Dict = Body(...)):
    total = data.get("total")
    if not total:
        raise HTTPException(status_code=400, detail="Total marks required")

    sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    questions = await db.questions.find({"exam_id": str(sub["exam_id"])}).to_list(500)
    qmap = {str(q["_id"]): q for q in questions}
    answers = sub.get("answers", {})

    api_key = os.getenv("GROQ_API_KEY")

    prompt = f"""
You are an experienced exam evaluator.
Evaluate answers based on relevance, clarity, correctness, and completeness.
Total Marks: {total}
Return ONLY valid JSON:
{{"score": number, "feedback": "short"}}
"""

    for qid, ans in answers.items():
        q = qmap.get(qid)
        if q:
            prompt += f"""
Question: {q.get("question")}
Student Answer: {ans}
"""

    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    raw = r.json()["choices"][0]["message"]["content"]
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise HTTPException(status_code=500, detail="AI returned invalid response")

    result = json.loads(match.group(0))
    score = max(0, min(int(result.get("score", 0)), total))

    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "score": score,
            "total": total,
            "evaluated": True,
            "ai_feedback": result.get("feedback", ""),
            "evaluated_at": _now_iso()
        }}
    )

    return {
        "score": score,
        "total": total,
        "feedback": result.get("feedback", "")
    }
# ---------------- PROCTOR REPORTS ----------------
@router.get("/proctor-reports")
async def get_proctor_reports():
    logs = await db.proctor_logs.find().to_list(5000)

    reports = {}

    for log in logs:
        student = log.get("student_name") or "Unknown"
        violation = log.get("type") or "Unclassified"

        if student not in reports:
            reports[student] = {}

        reports[student][violation] = reports[student].get(violation, 0) + 1

    return {"reports": reports}
# ---------------- PROCTOR LOGS ----------------
@router.get("/proctor-logs")
async def get_proctor_logs():
    logs = await db.proctor_logs.find().sort("timestamp", -1).to_list(5000)

    for log in logs:
        log["_id"] = str(log["_id"])

    return logs

