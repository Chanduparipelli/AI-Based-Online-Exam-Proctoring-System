import React, { useEffect, useState } from "react";
import "./teacher-pages.css";

const API = "http://127.0.0.1:8000";

function token() {
  return localStorage.getItem("access_token") || "";
}

export default function AddQuestion() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadExams() {
    try {
      const res = await fetch(`${API}/teacher/exams`, { headers: { Authorization: "Bearer " + token() } });
      const data = await res.json();
      setExams(data || []);
      if (data && data.length && !selectedExam) {
        setSelectedExam(data[0]._id);
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to load exams");
    }
  }

  async function loadQuestionsForExam(id) {
    if (!id) { setList([]); return; }
    try {
      const res = await fetch(`${API}/teacher/questions/${id}`, { headers: { Authorization: "Bearer " + token() } });
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to load questions");
    }
  }

  useEffect(() => {
    if (selectedExam) loadQuestionsForExam(selectedExam);
  }, [selectedExam]);

  function updateOption(i, v) {
    const arr = [...options];
    arr[i] = v;
    setOptions(arr);
  }

  async function addQuestion() {
    if (!selectedExam) return showToast("error", "Select exam");
    if (!question.trim()) return showToast("error", "Enter question");

    setLoading(true);
    try {
      const payload = {
        exam_id: selectedExam,
        question: question.trim(),
        options,
        correct_answer: options[correctIdx] || ""
      };
      const res = await fetch(`${API}/teacher/add-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.message || "Save failed");
      showToast("success", "Question saved");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectIdx(0);
      loadQuestionsForExam(selectedExam);
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="teacher-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <div className="panel-grid two-col">
        <div className="card create-card">
          <h3>Add Question</h3>

          <div className="form-row">
            <label>Exam</label>
            <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
              <option value="">-- select exam --</option>
              {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.title} • {ex.subject}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label>Question</label>
            <textarea rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Write the question..." />
          </div>

          <div className="form-row">
            <label>Options</label>
            <div className="options-grid">
              {options.map((opt, i) => (
                <div key={i} className="opt-row">
                  <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  <label className="radio-label">
                    <input type="radio" checked={correctIdx === i} onChange={() => setCorrectIdx(i)} /> correct
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={addQuestion} disabled={loading}>
              {loading ? "Saving…" : "Save Question"}
            </button>
            <button className="btn ghost" onClick={() => { setQuestion(""); setOptions(["","","",""]); setCorrectIdx(0); }}>
              Clear
            </button>
          </div>
        </div>

        <div className="card list-card">
          <div className="list-header">
            <h3>Questions</h3>
            <span className="muted">{list.length}</span>
          </div>

          <div className="question-list">
            {list.length === 0 && <div className="muted">No questions for selected exam</div>}
            {list.map((q) => (
              <div key={q._id} className="question-item">
                <div className="question-text">{q.question}</div>
                <div className="muted small">Options: {Array.isArray(q.options) ? q.options.join(" | ") : "-"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
