import base64
import cv2
import numpy as np
from fastapi import WebSocket
from bson import ObjectId
from db.mongodb import db
from ai.proctor import analyze_frame
import datetime

def _now():
    return datetime.datetime.utcnow().isoformat()


async def handle_proctor_ws(websocket: WebSocket):
    await websocket.accept()

    exam_id = None
    exam_title = "Exam"
    student_id = None
    student_name = "Unknown"

    print("🔗 WebSocket Connected")

    while True:
        try:
            data = await websocket.receive_json()

            # ================= INIT =================
            if data.get("type") == "init":
                exam_id = str(data.get("exam_id"))
                student_id = str(data.get("student_id"))
                student_name = data.get("student_name") or "Unknown"

                print(f"✅ INIT | exam={exam_id} student={student_name}")

                try:
                    exam = await db.exams.find_one({"_id": ObjectId(exam_id)})
                except:
                    exam = await db.exams.find_one({"_id": exam_id})

                if exam:
                    exam_title = exam.get("title") or "Exam"
                continue

            # ================= TAB SWITCH =================
            if data.get("type") == "tab_switch":
                print("⚠ TAB SWITCH DETECTED")

                if exam_id and student_id:
                    await db.proctor_logs.insert_one({
                        "exam_id": exam_id,
                        "exam_title": exam_title,
                        "student_id": student_id,
                        "student_name": student_name,
                        "type": "Tab Switch",
                        "timestamp": _now()
                    })

                await websocket.send_json({"warning": "Tab Switch"})
                continue

            # ================= FRAME =================
            if data.get("type") == "frame":
                print("📷 Frame received")

                if not exam_id or not student_id:
                    print("⛔ Missing exam/student")
                    continue

                raw = data.get("frame")
                if not raw:
                    print("⛔ Empty frame")
                    continue

                try:
                    image_bytes = base64.b64decode(raw)
                    np_img = np.frombuffer(image_bytes, np.uint8)
                    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
                except Exception as e:
                    print("❌ Frame decode failed:", e)
                    continue

                if frame is None or frame.size == 0:
                    print("❌ Invalid frame")
                    continue

                # ===== RUN AI =====
                result = await analyze_frame(frame)
                print("🎯 AI RESULT:", result)

                warning = result.get("warning")

                # ===== IF ANY WARNING, SAVE + SEND =====
                if warning:
                    print(f"🚨 WARNING TRIGGERED: {warning}")

                    await db.proctor_logs.insert_one({
                        "exam_id": exam_id,
                        "exam_title": exam_title,
                        "student_id": student_id,
                        "student_name": student_name,
                        "type": warning,
                        "timestamp": _now()
                    })

                    await websocket.send_json({"warning": warning})

        except Exception as e:
            print("❌ WebSocket Closed / Error:", e)
            try:
                await websocket.close()
            except:
                pass
            break

    print("🔌 WebSocket Disconnected")
