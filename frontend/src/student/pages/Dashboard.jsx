import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import StudentLayout from "../layout/StudentLayout";

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

function GradientStat({ label, value, icon, colorA, colorB }) {
  return (
    <div
      className="grad-stat"
      style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
    >
      <div className="gs-left">
        <div className="gs-icon">{icon}</div>
      </div>
      <div className="gs-right">
        <div className="gs-value">{value}</div>
        <div className="gs-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const user = getUser();
  const username =
    user?.username ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Student";

  useEffect(() => {
    fetchExams();
  }, []);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchExams() {
    setLoading(true);
    try {
      const headers = {};
      const token = getToken();
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch(`${API}/student/exams`, { headers });
      if (!res.ok) throw new Error("Failed to fetch exams");

      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : []).map((e) => ({
        ...e,
        _id: e._id || e.id || "",
        title: e.title || e.name || "Untitled Exam",
        subject: e.subject || e.topic || "",
        total_marks: e.total_marks || e.totalMarks || e.total || 0,
        duration: e.duration || 30,
        start_time: e.start_time || e.start || e.scheduled_at || null,
        created_at: e.created_at || e.createdAt || null,
        description: e.description || "",
      }));

      setExams(normalized);
    } catch (err) {
      console.error(err);
      showToast("error", "Could not load exams");
    } finally {
      setLoading(false);
    }
  }

  const now = Date.now();

  const filtered = exams.filter((e) => {
    if (
      query &&
      !(`${e.title} ${e.subject}`
        .toLowerCase()
        .includes(query.toLowerCase()))
    )
      return false;

    return true;
  });

  const upcoming = filtered.filter((e) => {
    if (!e.start_time) return false;
    const t = Date.parse(e.start_time);
    return !isNaN(t) ? t >= now : false;
  });

  const recent = [...filtered];

  const stats = {
    total: exams.length,
    upcoming: upcoming.length,
    recent: recent.length,
  };

  function startLearning(topic) {
    navigate(`/student/learn/${encodeURIComponent(topic)}`);
  }

  return (
    <StudentLayout>
      <div className="gradient-page">

        {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

        <header className="dash-header">
          <div>
            <h1 className="dash-title">Welcome back, {username}</h1>
            <p className="dash-sub">
              Interactive exam portal — real-time, responsive, and beautiful.
            </p>
          </div>
        </header>

        <section className="stats-row">
          <GradientStat label="Total Exams" value={stats.total} icon="📚" colorA="#7C3AED" colorB="#06B6D4" />
          <GradientStat label="Upcoming" value={stats.upcoming} icon="⏳" colorA="#F97316" colorB="#F43F5E" />
          <GradientStat label="Recent" value={stats.recent} icon="📝" colorA="#10B981" colorB="#06B6D4" />
        </section>

        <section className="courses-section">
          <h2 className="section-title">⭐ Recommended Learning</h2>

          <div className="courses-grid">

            <div className="course-card">
              <h3>📘 Data Structures</h3>
              <p>Strengthen your problem-solving and algorithmic thinking skills.</p>
              <button className="btn primary" onClick={() => startLearning("Data Structures")}>
                Start Learning
              </button>
            </div>

            <div className="course-card">
              <h3>📗 Database Management</h3>
              <p>Understand relational models, queries, and optimization techniques.</p>
              <button className="btn primary" onClick={() => startLearning("Database Management")}>
                Start Learning
              </button>
            </div>

            <div className="course-card">
              <h3>📙 Computer Networks</h3>
              <p>Learn protocols, architectures, and communication fundamentals.</p>
              <button className="btn primary" onClick={() => startLearning("Computer Networks")}>
                Start Learning
              </button>
            </div>

            <div className="course-card">
              <h3>📕 Operating Systems</h3>
              <p>Explore processes, scheduling, memory management, and concurrency.</p>
              <button className="btn primary" onClick={() => startLearning("Operating Systems")}>
                Start Learning
              </button>
            </div>

          </div>
        </section>

      </div>
    </StudentLayout>
  );
}
