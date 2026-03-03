import React, { useEffect, useState } from "react";
import StudentLayout from "../layout/StudentLayout";

const API = "http://127.0.0.1:8000";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token"); // ✅ TOKEN ADDED

      const res = await fetch(`${API}/student/results`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ TOKEN SENT TO BACKEND
        },
      });

      if (!res.ok) throw new Error("No results");
      setResults(await res.json());
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StudentLayout>
      <div className="student-results-page">
        <div className="student-results-header">
          <h2>📊 Your Results</h2>
          <p className="muted">Track your exam performance here</p>
        </div>

        {loading && <div className="muted">Loading…</div>}

        {!loading && (!results || results.length === 0) && (
          <div className="no-results-card">
            <h3>No results yet</h3>
            <p>You haven’t completed any exams.</p>
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div className="results-grid">
            {results.map((r) => (
              <div key={r._id || Math.random()} className="result-glass-card">
                <div className="result-top">
                  <h3>{r.exam_title || `Exam ${r.exam_id}`}</h3>
                  <span className="result-score">
                    {r.score !== undefined
                      ? `${r.score}/${r.total || "-"}`
                      : "Ungraded"}
                  </span>
                </div>

                <div className="result-meta">
                  <div>
                    Status:{" "}
                    {r.score !== undefined ? "Completed" : "Pending"}
                  </div>
                  <div>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
