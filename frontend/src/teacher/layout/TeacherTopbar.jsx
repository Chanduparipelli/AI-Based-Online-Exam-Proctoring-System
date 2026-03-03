import React from "react";

export default function TeacherTopbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="teacher-topbar">
      <div>
        <h3>Welcome, {user?.name || "Teacher"}</h3>
        <p className="t-top-sub">Manage all your exams & students here</p>
      </div>
      <span style={{ cursor: "pointer" }}>⚙ Settings</span>
    </div>
  );
}
