# backend/models/exam.py
from pydantic import BaseModel, Field
from typing import List, Optional
import datetime


class ExamCreate(BaseModel):
    title: str = Field(..., example="Midterm - Data Structures")
    subject: str = Field(..., example="Data Structures")
    total_marks: int = Field(..., example=100)
    duration: int = Field(..., description="Duration in minutes", example=90)
    teacher_id: str = Field(..., example="6931abcd...")  # store as string id


class QuestionCreate(BaseModel):
    exam_id: str = Field(..., example="645a12...")  # string exam id
    question: str = Field(..., example="What is a binary tree?")
    options: List[str] = Field(..., example=["A","B","C","D"])
    correct_answer: str = Field(..., example="A")


class ExamInDB(ExamCreate):
    id: Optional[str] = Field(None, alias="_id")
    created_at: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime.datetime: lambda v: v.isoformat()
        }
