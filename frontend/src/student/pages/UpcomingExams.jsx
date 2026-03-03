import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../layout/StudentLayout";
import "./upcomingExams.css";

const API = "http://127.0.0.1:8000";

export default function UpcomingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/exams`);
      const data = await res.json();
      setExams(Array.isArray(data) ? data : []);
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StudentLayout>
      <div className="upcoming-page">
        <div className="upcoming-header">
          <h1>📅 Upcoming Exams</h1>
          <p>View and attend your scheduled exams</p>
        </div>

        {loading && <div className="loading-text">Loading exams...</div>}

        {!loading && exams.length === 0 && (
          <div className="no-exams">No upcoming exams available</div>
        )}

        <div className="upcoming-grid">
          {exams.map((ex) => (
            <div key={ex._id} className="upcoming-card">
              <div className="exam-left">
                <h2>{ex.title}</h2>
                <p><b>Subject:</b> {ex.subject || "—"}</p>
                <p><b>Duration:</b> {ex.duration || "-"} min</p>
              </div>

              <div className="exam-right">
                <div className="exam-marks">{ex.total_marks || "-"} pts</div>
                <button
                  className="start-btn"
                  onClick={() =>
                    navigate(`/student/exam-instructions?exam_id=${ex._id}`)
                  }
                >
                  ▶ Start Exam
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
