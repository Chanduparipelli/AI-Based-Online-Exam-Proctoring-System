import React, { useEffect, useState, useRef } from "react";

const API = "http://127.0.0.1:8000";

export default function ExamPage() {
  const params = new URLSearchParams(window.location.search);
  const exam_id = params.get("exam_id");
  const user = JSON.parse(localStorage.getItem("user"));

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [topWarning, setTopWarning] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const frameTimerRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  useEffect(() => {
    fetchQuestions();
    fetchExamDuration();
    initCameraAndProctor();
    detectTabSwitch();

    return () => cleanup();
  }, []);

  function cleanup() {
    try { clearInterval(frameTimerRef.current); } catch {}
    try { clearInterval(timerRef.current); } catch {}

    try {
      wsRef.current?.close?.();
    } catch {}

    try {
      const tracks = videoRef.current?.srcObject?.getTracks?.() || [];
      tracks.forEach((t) => t.stop?.());
    } catch {}
  }

  async function fetchQuestions() {
    try {
      const res = await fetch(`${API}/student/exam/${exam_id}/questions`);
      setQuestions(await res.json());
    } catch {}
  }

  async function fetchExamDuration() {
    try {
      const res = await fetch(`${API}/teacher/exams`);
      const all = await res.json();
      const exam = all.find((x) => x._id === exam_id);
      setTimeLeft(exam?.duration ? exam.duration * 60 : 1800);
    } catch {
      setTimeLeft(1800);
    }
  }

  function showWarning(w) {
    setTopWarning(w);
    setTimeout(() => setTopWarning(""), 5000);
  }

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function detectTabSwitch() {
    async function handleViolation() {
      showWarning("Tab Switch Detected — Exam Submitted!");
      await autoSubmit();
    }

    window.addEventListener("blur", handleViolation);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleViolation();
    });
  }

  async function initCameraAndProctor() {
    if (!user) {
      setPermissionError("User not found. Please login again.");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    } catch {
      setPermissionError("Camera permission denied");
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = async () => await video.play();

    startWebSocket();   // ⭐ separate clean function
    startTimerIfReady();
  }

  function startWebSocket() {
    if (wsRef.current) return; // prevent multiple sockets

    console.log("🔗 Connecting WebSocket...");
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws/proctor");

    wsRef.current.onopen = () => {
      console.log("🟢 WebSocket Connected");

      wsRef.current.send(
        JSON.stringify({
          type: "init",
          exam_id,
          student_id: user?.id || user?._id || "unknown",
          student_name: user?.username || user?.name || "Student"
        })
      );

      frameTimerRef.current = setInterval(sendFrame, 300);
    };

    wsRef.current.onmessage = (evt) => {
      try {
        const d = JSON.parse(evt.data);
        if (d.warning) showWarning(d.warning);
      } catch {}
    };

    wsRef.current.onclose = () => {
      console.log("🔌 WebSocket Disconnected");
    };

    wsRef.current.onerror = () => {
      console.log("❌ WebSocket Error");
    };
  }

  function startTimerIfReady() {
    if (timeLeft == null) {
      setTimeout(startTimerIfReady, 300);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          autoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function sendFrame() {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;

    const v = videoRef.current;
    if (!v || !v.videoWidth) return;

    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = Math.round((v.videoHeight / v.videoWidth) * 640);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    const pureBase64 = canvas
      .toDataURL("image/jpeg", 0.85)
      .replace(/^data:image\/jpeg;base64,/, "");

    wsRef.current.send(
      JSON.stringify({
        type: "frame",
        frame: pureBase64
      })
    );
  }

  async function autoSubmit() {
    try {
      const token = localStorage.getItem("access_token");

      await fetch(`${API}/student/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exam_id,
          answers
        }),
      });
    } catch {}

    cleanup();
    window.location.href = "/student/exam-finish";
  }

  const q = questions[currentIndex];
  const mins = timeLeft != null ? Math.floor(timeLeft / 60) : 0;
  const secs = timeLeft != null ? timeLeft % 60 : 0;

  return (
    <div style={{ padding: 30, position: "relative" }}>
      {topWarning && (
        <div style={{ background: "#ff4d4d", color: "white", padding: 12, borderRadius: 6 }}>
          ⚠ {topWarning}
        </div>
      )}

      {permissionError && (
        <div style={{ background: "#fff3f3", color: "#900", padding: 12, borderRadius: 6 }}>
          {permissionError}
        </div>
      )}

      <div style={{ fontSize: 20, fontWeight: "bold" }}>
        Time Left: {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>

      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: 360, border: "3px solid red", borderRadius: 10 }}
      />

      {q && (
        <div style={{ marginTop: 16 }}>
          <h3>Question {currentIndex + 1} / {questions.length}</h3>
          <p>{q.question}</p>

          {q.options && q.options.length > 0 ? (
            <>
              {q.options.map((op, i) => (
                <button
                  key={i}
                  onClick={() => setAnswer(q._id, op)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    marginTop: "8px",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    background: answers[q._id] === op ? "#007bff" : "#444",
                    color: "white"
                  }}
                >
                  {op}
                </button>
              ))}
            </>
          ) : (
            <textarea
              value={answers[q._id] || ""}
              onChange={(e) => setAnswer(q._id, e.target.value)}
              placeholder="Write your answer here..."
              style={{
                width: "100%",
                minHeight: "220px",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                borderRadius: "12px",
                padding: "18px",
                fontSize: "18px"
              }}
            />
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>Previous</button>
        <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex((i) => i + 1)}>Next</button>
      </div>

      <button
        onClick={autoSubmit}
        style={{ marginTop: 16, padding: 12, background: "green", color: "white" }}
      >
        Submit Exam
      </button>
    </div>
  );
}
