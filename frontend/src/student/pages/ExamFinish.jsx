import React, { useEffect, useState } from "react";
import StudentLayout from "../layout/StudentLayout";

const API = "http://127.0.0.1:8000";

export default function ExamFinish() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const lastExamId = new URLSearchParams(window.location.search).get("exam_id");
    if (lastExamId) {
      fetchSummary(lastExamId);
    } else {
      setSummary({
        face_detected: true,
        suspicious_count: 0,
      });
    }
  }, []);

  async function fetchSummary(examId) {
    try {
      const res = await fetch(`${API}/teacher/proctor-logs/${examId}`);
      if (!res.ok) {
        setSummary({ face_detected: true, suspicious_count: 0 });
        return;
      }
      const logs = await res.json();
      const suspicious = logs.filter((l) => (l.events && l.events.length > 0) || (l.event && l.event !== "no_warning")).length;
      setSummary({
        face_detected: logs.some(l => (l.details && (l.details.face_visible === true)) ) || true,
        suspicious_count: suspicious,
        last_events: logs.slice(-5).reverse(),
      });
    } catch {
      setSummary({ face_detected: true, suspicious_count: 0 });
    }
  }

  return (
    <StudentLayout>
      <div className="card">
        <h2>Exam Submitted</h2>
        <p>Your responses are recorded and submitted.</p>

        <div className="card" style={{ marginTop: 15 }}>
          <h3>AI Proctoring Summary</h3>
          {!summary && <div className="muted">Loading summary…</div>}

          {summary && (
            <>
              <p>Face Detected: {summary.face_detected ? "Yes" : "No"}</p>
              <p>Suspicious Activity Count: {summary.suspicious_count}</p>

              {summary.last_events && summary.last_events.length > 0 && (
                <>
                  <h4>Last events</h4>
                  <ul>
                    {summary.last_events.map((e, idx) => (
                      <li key={idx}>
                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : "—"} — {e.events ? e.events.join(", ") : e.event || "No details"}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
