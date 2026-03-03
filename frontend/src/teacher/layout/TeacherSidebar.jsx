import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherSidebar() {
  const navigate = useNavigate();

  return (
    <div className="teacher-sidebar">
      <h2>Teacher Panel</h2>
      <ul>
        <li onClick={() => navigate("/teacher/dashboard")}>Dashboard</li>
        <li onClick={() => navigate("/teacher/create-exam")}>Create Exam</li>
        <li onClick={() => navigate("/teacher/view-exams")}>Manage Exams</li>
        <li onClick={() => navigate("/teacher/submissions")}>Student Submissions</li>
        <li onClick={() => navigate("/teacher/proctor-logs")}>AI Proctor Reports</li>
        <li onClick={() => navigate("/teacher/profile")}>Profile</li>
        <li onClick={() => navigate("/")}>Logout</li>
      </ul>
    </div>
  );
}
