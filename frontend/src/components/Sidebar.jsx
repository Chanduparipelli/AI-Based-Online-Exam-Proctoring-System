// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

function getUserRole() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.role || "student";
  } catch {
    return "student";
  }
}

export default function Sidebar() {
  const role = getUserRole();

  return (
    <div className="sidebar-inner">
      <div className="brand">IdeaHub</div>

      <nav className="nav">
        {role === "student" ? (
          <>
            <NavLink to="/student/dashboard" className="nav-link">Dashboard</NavLink>
            <NavLink to="/student/upcoming-exams" className="nav-link">Upcoming Exams</NavLink>
            <NavLink to="/student/results" className="nav-link">Results</NavLink>
            <NavLink to="/student/profile" className="nav-link">Profile</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/teacher/dashboard" className="nav-link">Dashboard</NavLink>
            <NavLink to="/teacher/create-exam" className="nav-link">Create Exam</NavLink>
            <NavLink to="/teacher/add-questions" className="nav-link">Add Questions</NavLink>
            <NavLink to="/teacher/view-exams" className="nav-link">View Exams</NavLink>
            <NavLink to="/teacher/results" className="nav-link">View Results</NavLink>
            <NavLink to="/teacher/proctor-logs" className="nav-link">Proctor Logs</NavLink>
            <NavLink to="/teacher/profile" className="nav-link">Profile</NavLink>
          </>
        )}
      </nav>
    </div>
  );
}
