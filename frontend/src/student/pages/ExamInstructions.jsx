import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExamInstructions() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const exam_id = params.get("exam_id");

  const [accepted, setAccepted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function enableFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function startExam() {
    navigate(`/student/exam?exam_id=${exam_id}`);
  }

  const canStart = accepted && isFullscreen;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#020617)",
        color: "#fff",
        padding: 40,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 10 }}>
          AI-Based Online Exam – Instructions
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginBottom: 30,
          }}
        >
          Secure • Smart • AI-Proctored Examination Platform
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: 30,
            borderRadius: 14,
          }}
        >
          <h3>📌 General Instructions</h3>
          <ul>
            <li>This exam is monitored using AI-based live proctoring.</li>
            <li>Your webcam must remain ON throughout the exam.</li>
            <li>Face must be clearly visible at all times.</li>
            <li>Only one person should appear in front of the camera.</li>
          </ul>

          <h3>🚫 Prohibited Activities</h3>
          <ul>
            <li>Switching browser tabs or windows.</li>
            <li>Using mobile phones or smart devices.</li>
            <li>Looking away from the screen repeatedly.</li>
            <li>Leaving the camera frame during the exam.</li>
          </ul>

          <h3>💻 System Requirements</h3>
          <ul>
            <li>Stable internet connection.</li>
            <li>Webcam permission must be enabled.</li>
            <li>Use Chrome or Edge browser.</li>
            <li>Do not refresh or close the browser.</li>
          </ul>

          <h3>⏱️ Exam Rules</h3>
          <ul>
            <li>Timer starts immediately after exam begins.</li>
            <li>Auto-submit occurs when time ends.</li>
            <li>Submitted answers cannot be modified.</li>
          </ul>

          {/* FULLSCREEN */}
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
            }}
          >
            <button
              onClick={enableFullscreen}
              disabled={isFullscreen}
              style={{
                padding: "10px 20px",
                background: isFullscreen ? "#16a34a" : "#2563eb",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: isFullscreen ? "default" : "pointer",
              }}
            >
              {isFullscreen ? "✔ Full Screen Enabled" : "Enable Full Screen"}
            </button>
          </div>

          {/* ACCEPT */}
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
              opacity: isFullscreen ? 1 : 0.5,
            }}
          >
            <input
              type="checkbox"
              disabled={!isFullscreen}
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ marginRight: 10 }}
            />
            I have read and agree to all exam rules and AI-based proctoring.
          </div>

          {/* START BUTTON */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 30,
            }}
          >
            <button
              onClick={startExam}
              disabled={!canStart}
              style={{
                padding: "12px 30px",
                background: canStart ? "#22c55e" : "#64748b",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                cursor: canStart ? "pointer" : "not-allowed",
                opacity: canStart ? 1 : 0.6,
              }}
            >
              I Agree & Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
