import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher.css";

const API = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function StatCard({ label, value, icon, colorA, colorB }) {
  return (
    <div className="t-stat-card" style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}>
      <div className="t-stat-icon">{icon}</div>
      <div className="t-stat-info">
        <div className="t-stat-value">{value}</div>
        <div className="t-stat-label">{label}</div>
      </div>
    </div>
  );
}

function ExamTypeCard({ title, subtitle, icon, gradientFrom, gradientTo, onClick }) {
  return (
    <div
      className="t-exam-type-card"
      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      onClick={onClick}
    >
      <div className="t-exam-type-icon">{icon}</div>
      <div className="t-exam-type-text">
        <div className="t-exam-type-title">{title}</div>
        <div className="t-exam-type-sub">{subtitle}</div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");

  const user = getUser();
  const teacherName =
    user?.username || user?.name || (user?.email ? user.email.split("@")[0] : "") || "Teacher";

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const headers = {};
      const token = getToken();
      if (token) headers.Authorization = "Bearer " + token;
      const res = await fetch(`${API}/teacher/exams`, { headers });
      const data = await res.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  }

  function classifyStatus(exam) {
    if (exam.status) return exam.status;
    return "unknown";
  }

  const totalExams = exams.length;

  let displayedExams = exams;
  if (viewFilter !== "all") {
    displayedExams = exams.filter((e) => classifyStatus(e) === viewFilter);
  }

  return (
    <>
      {/* ✅ TOP AREA */}
      <div className="teacher-topbar">
        <div>
          <h2 className="t-top-title">Teacher Dashboard</h2>
          <p className="t-top-sub">Welcome back, {teacherName}</p>
        </div>
      </div>

      {/* ✅ STATS */}
      <div className="t-stats-row">
        <StatCard label="Total Exams" value={totalExams} icon="📚" colorA="#7C3AED" colorB="#06B6D4" />
        <StatCard label="Upcoming" value="0" icon="⏳" colorA="#F97316" colorB="#F97316" />
        <StatCard label="Running" value="0" icon="🟢" colorA="#22C55E" colorB="#16A34A" />
        <StatCard label="Finished" value="0" icon="✅" colorA="#0EA5E9" colorB="#6366F1" />
      </div>

      {/* ✅ EXAM TYPES */}
      <div className="t-exam-types">
        <ExamTypeCard title="MCQ Exam" subtitle="Single/multi choice" icon="🔘" gradientFrom="#4F46E5" gradientTo="#06B6D4" onClick={() => navigate("/teacher/create-exam?type=mcq")} />
        <ExamTypeCard title="Descriptive" subtitle="Theory answers" icon="✍️" gradientFrom="#EC4899" gradientTo="#F97316" onClick={() => navigate("/teacher/create-exam?type=descriptive")} />
        <ExamTypeCard title="Coding" subtitle="Programs" icon="💻" gradientFrom="#22C55E" gradientTo="#0EA5E9" onClick={() => navigate("/teacher/create-exam?type=coding")} />
        <ExamTypeCard title="Mixed" subtitle="MCQ + Theory" icon="🎯" gradientFrom="#8B5CF6" gradientTo="#EC4899" onClick={() => navigate("/teacher/create-exam?type=mixed")} />
      </div>

      {/* ✅ EXAMS LIST */}
      <div className="t-panel">
        <div className="t-panel-header">
          <h2 className="t-panel-title">Your Exams</h2>
        </div>

        {loading && <div className="t-empty-note">Loading...</div>}

        {!loading && displayedExams.length === 0 && (
          <div className="t-empty-note">No exams created yet.</div>
        )}

        <div className="t-exams-grid">
          {!loading &&
            displayedExams.map((ex) => (
              <div key={ex._id} className="t-exam-card">
                <div className="t-exam-card-top">
                  <div className="t-exam-title">{ex.title}</div>
                  <div className="t-badge t-status-unknown">UNKNOWN</div>
                </div>
                <div className="t-exam-sub">
                  {ex.subject || "General"} • {ex.duration || 0} min • {ex.total_marks || 0} marks
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
