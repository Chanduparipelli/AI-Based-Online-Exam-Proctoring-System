import cv2
import mediapipe as mp

mp_face = mp.solutions.face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = mp_face.process(rgb)

    if result.detections:
        print("FACE DETECTED")
    else:
        print("NO FACE")

    cv2.imshow("test", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
