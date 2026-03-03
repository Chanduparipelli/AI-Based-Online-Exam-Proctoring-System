from fastapi import APIRouter, HTTPException, Depends, Request
from db.mongodb import db
from bson import ObjectId
from typing import Dict
import datetime
import os
import requests


router = APIRouter(prefix="/student", tags=["student"])

try:
    from core.auth import get_current_user
except Exception:
    def get_current_user():
        return None


def _now_iso():
    return datetime.datetime.utcnow().isoformat()


def _extract_user_id(current_user):
    if not current_user:
        return None
    if isinstance(current_user, dict):
        return str(
            current_user.get("_id")
            or current_user.get("id")
            or current_user.get("sub")
        )
    return None


def _extract_user_name(current_user):
    if not current_user:
        return None
    if isinstance(current_user, dict):
        return (
            current_user.get("name")
            or current_user.get("username")
            or current_user.get("email")
        )
    return None


# ---------------- GET EXAMS ----------------
@router.get("/exams")
async def get_upcoming_exams():
    exams = await db.exams.find().to_list(500)
    for ex in exams:
        ex["_id"] = str(ex["_id"])
    return exams


# ---------------- GET QUESTIONS ----------------
@router.get("/exam/{exam_id}/questions")
async def get_exam_questions(exam_id: str):
    questions = await db.questions.find({
        "$or": [
            {"exam_id": exam_id},
            {"exam_id": str(exam_id)}
        ]
    }).to_list(500)

    for q in questions:
        q["_id"] = str(q["_id"])

    return questions


# ---------------- SUBMIT EXAM ----------------
@router.post("/submit")
async def submit_exam(request: Request, current_user: dict = Depends(get_current_user)):

    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # -------------------------
    # ⭐ SUPPORT BOTH JSON + FORMDATA
    # -------------------------
    try:
        data = await request.json()
    except:
        form = await request.form()
        data = dict(form)

    exam_id = data.get("exam_id")
    answers = data.get("answers")

    if not exam_id:
        raise HTTPException(status_code=400, detail="exam_id missing")

    if answers is None:
        raise HTTPException(status_code=400, detail="answers missing")

    # Convert answers safely
    final_answers = {}

    # If frontend sends JSON string -> convert to dict
    if isinstance(answers, str):
        import json
        try:
            answers = json.loads(answers)
        except:
            pass

    if isinstance(answers, dict):
        for k, v in answers.items():
            final_answers[str(k)] = v

    elif isinstance(answers, list):
        for a in answers:
            qid = str(a.get("question_id") or a.get("_id") or a.get("id"))
            ans = a.get("answer")
            if qid:
                final_answers[qid] = ans

    else:
        raise HTTPException(status_code=400, detail="Invalid answers format")

    student_id = _extract_user_id(current_user)
    student_name = _extract_user_name(current_user)

    if not student_id or not student_name:
        raise HTTPException(status_code=400, detail="Student identity error")

    # ---------------- FETCH EXAM TITLE ----------------
    exam = None
    try:
        exam = await db.exams.find_one({"_id": ObjectId(exam_id)})
    except:
        exam = await db.exams.find_one({"_id": exam_id})

    exam_title = exam.get("title") if exam and exam.get("title") else "Exam"

    submission_doc = {
        "exam_id": str(exam_id),
        "exam_title": exam_title,
        "student_id": student_id,
        "student_name": student_name,
        "answers": final_answers,
        "submitted_at": _now_iso(),
        "evaluated": False,
        "score": None,
        "total": None
    }

    # ⭐ ALWAYS SAVE — ONLY ONE PER STUDENT
    await db.submissions.update_one(
        {"exam_id": str(exam_id), "student_id": student_id},
        {"$set": submission_doc},
        upsert=True
    )

    return {"message": "Exam submitted successfully"}


# ---------------- RESULTS ----------------
@router.get("/results")
async def get_results(current_user: dict = Depends(get_current_user)):
    subs = await db.submissions.find(
        {"evaluated": True}
    ).sort("submitted_at", -1).to_list(200)

    results = []
    for s in subs:
        results.append(
            {
                "_id": str(s["_id"]),
                "exam_id": s.get("exam_id"),
                "exam_title": s.get("exam_title") or "Exam",
                "score": s.get("score"),
                "total": s.get("total"),
                "created_at": s.get("submitted_at"),
            }
        )

    return results
@router.post("/course-content")
async def generate_course_content(data: Dict):
    topic = data.get("topic")

    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")

    api_key = os.getenv("GROQ_API_KEY")

    prompt = f"""
You are an expert university tutor.

Teach the topic: "{topic}"

Follow this EXACT structure:

TITLE:
Write the topic name

INTRODUCTION:
Provide a clear beginner-friendly explanation.

KEY CONCEPTS:
Use bullet points.

EXPLANATION:
Explain concepts in simple language.

EXAMPLES:
Provide easy practical examples.

SUMMARY:
Give a short revision-friendly recap.

IMPORTANT RULES:
- Use clean spacing
- No markdown symbols
- No bold text
- No special characters
- Keep it well structured
- Make it easy to read on a student dashboard

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

    return {"content": raw}
