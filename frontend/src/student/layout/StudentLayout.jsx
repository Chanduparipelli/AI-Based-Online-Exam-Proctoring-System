import React from "react";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import "../../student/student.css";

export default function StudentLayout({ children }) {
  return (
    <div className="student-layout">
      <StudentSidebar />

      <div className="student-main">
        <StudentTopbar />
        <div className="student-content">
          {children}
        </div>
      </div>
    </div>
  );
}
