from fastapi import FastAPI
from pydantic import BaseModel
import base64
import cv2
import numpy as np
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# ⭐ Enable CORS (Fixes OPTIONS 405 & Browser Blocking)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # or put your frontend origin only
    allow_credentials=True,
    allow_methods=["*"],          # <-- IMPORTANT
    allow_headers=["*"],          # <-- IMPORTANT
)

model = YOLO("yolov8s.pt")  


class Frame(BaseModel):
    frame: str


@app.post("/detect")
async def detect_phone(payload: Frame):

    data = payload.frame.split(",")[1] if "," in payload.frame else payload.frame
    img_bytes = base64.b64decode(data)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img, verbose=False)

    max_conf = 0.0
    for r in results:
        if not r.boxes:
            continue
        for cls, conf in zip(r.boxes.cls, r.boxes.conf):
            if int(cls) == 67:   # Mobile phone class
                if float(conf) > max_conf:
                    max_conf = float(conf)

    return {
        "phone_detected": max_conf >= 0.15,
        "phone_confidence": max_conf
    }
