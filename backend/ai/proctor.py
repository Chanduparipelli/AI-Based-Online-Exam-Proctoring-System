import cv2
import httpx
import base64
import numpy as np

YOLO_SERVICE_URL = "http://127.0.0.1:9000/detect"
PHONE_CONF_THRESHOLD = 0.15

# Load OpenCV Face Detector
face_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def analyze_frame_sync(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(80, 80)
    )

    face_visible = len(faces) > 0
    multiple_faces = len(faces) > 1
    looking_away = False

    if face_visible:
        (x, y, w, h) = faces[0]
        cx = x + w / 2
        frame_center = frame.shape[1] / 2
        if abs(cx - frame_center) > frame.shape[1] * 0.35:
            looking_away = True

    return {
        "face_visible": face_visible,
        "multiple_faces": multiple_faces,
        "looking_away": looking_away
    }


async def check_phone_async(frame):
    try:
        _, buf = cv2.imencode(".jpg", frame)
        b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(YOLO_SERVICE_URL, json={"frame": b64})
            j = r.json()

            if j.get("phone_detected"):
                return float(j.get("phone_confidence", 0.0))

    except:
        pass

    return 0.0


async def analyze_frame(frame):
    try:
        base = analyze_frame_sync(frame)
    except:
        return {"warning": None}

    phone_conf = await check_phone_async(frame)

    if not base["face_visible"]:
        return {"warning": "Face Not Visible"}

    if base["multiple_faces"]:
        return {"warning": "Multiple Faces Detected"}

    if base["looking_away"]:
        return {"warning": "Looking Away"}

    if phone_conf >= PHONE_CONF_THRESHOLD:
        return {"warning": "Phone Detected"}

    return {"warning": None}
