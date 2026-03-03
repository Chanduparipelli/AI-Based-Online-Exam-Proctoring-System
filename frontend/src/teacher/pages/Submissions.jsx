import React from "react";
import TeacherLayout from "../layout/TeacherLayout";

export default function Submissions() {
  return (
    <TeacherLayout>
      <div className="card">
        <h2>Student Submissions</h2>

        <div className="card">
          <h3>John Doe</h3>
          <p>AI & ML Exam</p>
          <button>View Answers</button>
        </div>

        <div className="card">
          <h3>Riya Sharma</h3>
          <p>DSA Exam</p>
          <button>View Answers</button>
        </div>
      </div>
    </TeacherLayout>
  );
}
