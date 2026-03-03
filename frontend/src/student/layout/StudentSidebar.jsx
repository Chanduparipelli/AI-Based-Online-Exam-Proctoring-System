import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <div className="student-sidebar">
      <div className="student-brand">
        🎓 Student Panel
      </div>

      <ul className="student-menu">
        <li className={isActive("/student/dashboard")} onClick={() => navigate("/student/dashboard")}>
          Dashboard
        </li>

        <li className={isActive("/student/upcoming-exams")} onClick={() => navigate("/student/upcoming-exams")}>
          Upcoming Exams
        </li>

        <li className={isActive("/student/results")} onClick={() => navigate("/student/results")}>
          Results
        </li>

        <li className={isActive("/student/profile")} onClick={() => navigate("/student/profile")}>
          Profile
        </li>

        <li className="logout" onClick={() => navigate("/")}>
          Logout
        </li>
      </ul>
    </div>
  );
}
