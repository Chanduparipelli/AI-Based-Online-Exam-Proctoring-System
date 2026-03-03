import React, { useEffect, useState } from "react";
import "../teacher.css";

const API = "http://127.0.0.1:8000";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [logs, setLogs] = useState([]);

  const [score, setScore] = useState("");
  const [total, setTotal] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API}/teacher/submissions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  async function openSubmission(s) {
    setSelected(s);
    setScore(s.score ?? "");
    setTotal(s.total ?? "");
    setQuestions([]);
    setLogs([]);
    setAiFeedback("");
    setDetailLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API}/teacher/submissions/${s._id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      const data = await res.json();
      setQuestions(data.questions || []);
      setLogs(data.cheating_logs || []);
      if (data.submission?.ai_feedback) setAiFeedback(data.submission.ai_feedback);
    } catch {
      alert("Failed to load submission details");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveMarks() {
    if (score === "" || total === "") {
      alert("Enter valid marks");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${API}/teacher/submissions/${selected._id}/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            score: Number(score),
            total: Number(total)
          })
        }
      );

      if (!res.ok) throw new Error();

      alert("✅ Marks saved");
      setSelected(null);
      setScore("");
      setTotal("");
      fetchSubmissions();
    } catch {
      alert("❌ Failed to save marks");
    }
  }

  async function aiEvaluate() {
    if (!total) {
      alert("Enter total marks before AI evaluate");
      return;
    }

    setAiLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${API}/teacher/ai-evaluate/${selected._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            total: Number(total)
          })
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "AI failed");

      alert("🤖 AI Evaluation Completed");

      setScore(data.score || 0);
      setAiFeedback(data.feedback || "");
      fetchSubmissions();
    } catch {
      alert("❌ AI Evaluation Failed");
    } finally {
      setAiLoading(false);
    }
  }

  const filtered = submissions.filter(
    (s) =>
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.exam_title?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedLogs = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="teacher-topbar">
        <div>
          <h2 className="t-top-title">Student Submissions</h2>
          <p className="t-top-sub">Review, evaluate & award marks</p>
        </div>

        <div className="t-top-actions">
          <input
            className="t-btn ghost"
            placeholder="Search student / exam"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="t-btn ghost" onClick={fetchSubmissions}>
            Refresh
          </button>
        </div>
      </div>

      <div className="t-panel">
        {loading && <div className="t-empty-note">Loading submissions...</div>}

        {!loading && filtered.length === 0 && (
          <div className="t-empty-note">No submissions found</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="t-exams-grid">
            {filtered.map((s, i) => (
              <div key={i} className="t-exam-card">
                <div className="t-exam-card-top">
                  <div className="t-exam-title">
                    {s.exam_title || "Untitled Exam"}
                  </div>
                  <div
                    className={`t-badge ${
                      s.evaluated ? "t-status-finished" : "t-status-pending"
                    }`}
                  >
                    {s.evaluated ? "Evaluated" : "Pending"}
                  </div>
                </div>

                <div className="t-exam-sub">
                  {s.student_name} •{" "}
                  {s.score !== null ? `${s.score}/${s.total}` : "Not graded"}
                </div>

                <div className="t-exam-meta">
                  <div className="t-exam-time">
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleString()
                      : "—"}
                  </div>

                  <div className="t-exam-actions">
                    <button
                      className="t-btn small"
                      onClick={() => openSubmission(s)}
                    >
                      View & Evaluate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="t-modal-wrap" onClick={() => setSelected(null)}>
          <div className="t-modal" onClick={(e) => e.stopPropagation()}>
            <div className="t-modal-header">
              <h3>{selected.exam_title}</h3>
              <div className="muted small">{selected.student_name}</div>
            </div>

            <div className="t-modal-body">
              <h4>Submitted Answers</h4>

              {detailLoading && <div className="muted">Loading answers…</div>}

              {!detailLoading &&
                questions.map((q, i) => (
                  <div key={i} className="t-answer-box">
                    <strong>Q{i + 1}.</strong> {q.question}
                    <div className="t-answer">
                      {q.student_answer || "No answer"}
                    </div>
                  </div>
                ))}

              {logs.length > 0 && (
                <>
                  <h4 style={{ color: "red", marginTop: 20 }}>
                    Cheating Summary
                  </h4>

                  {Object.entries(groupedLogs).map(([type, count], i) => (
                    <div key={i} className="cheat-box">
                      {type} → {count} times
                    </div>
                  ))}
                </>
              )}

              {!selected.evaluated && (
                <div className="t-eval-box">
                  <input
                    type="number"
                    placeholder="Score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Total Marks"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                  />

                  <button className="t-btn" onClick={saveMarks}>
                    Save Marks
                  </button>

                  <button
                    className="t-btn"
                    style={{ background: "#6a00ff" }}
                    onClick={aiEvaluate}
                    disabled={aiLoading}
                  >
                    {aiLoading ? "Evaluating…" : "🤖 AI Evaluate"}
                  </button>
                </div>
              )}

              {aiFeedback && (
                <div className="t-answer-box" style={{ marginTop: 20 }}>
                  <strong>AI Feedback</strong>
                  <div className="t-answer">{aiFeedback}</div>
                </div>
              )}

              {selected.evaluated && (
                <div className="t-evaluated-box">
                  ✅ Already Evaluated: {selected.score}/{selected.total}
                </div>
              )}
            </div>

            <div className="t-modal-actions">
              <button
                className="t-btn ghost"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
