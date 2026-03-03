import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: "250px",
      height: "100vh",
      background: "#2d2f30",
      color: "#fff",
      paddingTop: "20px",
      position: "fixed",
      left: 0,
      top: 0
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Teacher Panel</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <Link className="sideLink" to="/teacher/dashboard">📊 Dashboard</Link>
        <Link className="sideLink" to="/teacher/create-exam">➕ Create Exam</Link>
        <Link className="sideLink" to="/teacher/add-questions">📝 Add Questions</Link>
        <Link className="sideLink" to="/teacher/view-exams">📚 View Exams</Link>
        <Link className="sideLink" to="/teacher/results">🏆 Results</Link>
        <Link className="sideLink" to="/teacher/proctor-logs">🎥 Proctor Logs</Link>
        <Link className="sideLink" to="/teacher/profile">👤 Profile</Link>
      </div>

      <style>{`
        .sideLink {
          color: white;
          padding: 12px;
          text-decoration: none;
          transition: 0.2s;
          padding-left: 25px;
        }
        .sideLink:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
