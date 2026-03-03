import os
import logging
from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from api import auth, exam, student, teacher
from api.proctor_logs import router as logs_router
from api.ai_report import router as report_router
from db.mongodb import db, create_indexes
from ws.proctor_ws import proctor_socket
from dotenv import load_dotenv
load_dotenv()


LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("ai-exam-backend")

ALLOW_ORIGINS = os.getenv(
    "ALLOW_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app = FastAPI(title="AI Exam Proctoring Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOW_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exam.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(logs_router)
app.include_router(report_router)

@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Exam Proctoring Backend"}

@app.on_event("startup")
async def on_startup():
    try:
        await create_indexes()
    except Exception as e:
        logger.exception(e)

@app.on_event("shutdown")
async def on_shutdown():
    try:
        client = getattr(db, "client", None)
        if client:
            client.close()
    except Exception:
        pass

@app.websocket("/ws/proctor")
async def proctor_ws(websocket: WebSocket):
    await proctor_socket(websocket)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
