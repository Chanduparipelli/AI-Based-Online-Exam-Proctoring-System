import React, { useEffect, useState } from "react";
import TeacherLayout from "../layout/TeacherLayout";

const API = "http://127.0.0.1:8000";

export default function ProctoringReports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API}/teacher/proctor-reports`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = await res.json();
      setReports(data.reports || {});
    } catch (err) {
      console.error(err);
      setReports({});
    } finally {
      setLoading(false);
    }
  }

  function calculateRisk(violations) {
    const total = Object.values(violations).reduce((a, b) => a + b, 0);

    if (total > 10) return "High 🚨";
    if (total > 4) return "Medium ⚠️";
    return "Low ✅";
  }

  return (
    <TeacherLayout>
      <div className="card">
        <h2>AI Proctoring Reports</h2>

        {loading && <p>Loading reports...</p>}

        {!loading && Object.keys(reports).length === 0 && (
          <p>No reports available</p>
        )}

        {!loading &&
          Object.entries(reports).map(([student, violations], i) => (
            <div key={i} className="card">
              <h3>{student}</h3>
              <p>Cheating Risk: {calculateRisk(violations)}</p>

              {Object.entries(violations).map(([type, count], j) => (
                <p key={j}>
                  {type} → {count}
                </p>
              ))}
            </div>
          ))}
      </div>
    </TeacherLayout>
  );
}
