import React from "react";
import TeacherSidebar from "./TeacherSidebar";
import TeacherTopbar from "./TeacherTopbar";
import "../teacher.css";

export default function TeacherLayout({ children }) {
  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <div className="teacher-main">
        <TeacherTopbar />
        {children}
      </div>
    </div>
  );
}
