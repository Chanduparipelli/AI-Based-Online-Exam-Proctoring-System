import React from "react";
import TeacherLayout from "../layout/TeacherLayout";

export default function ManageExams() {
  return (
    <TeacherLayout>
      <div className="card">
        <h2>Manage Exams</h2>

        <div className="card">
          <h3>AI & ML Exam</h3>
          <button>Edit</button>
          <button style={{ marginLeft: 10 }}>Delete</button>
        </div>

        <div className="card" style={{ marginTop: 15 }}>
          <h3>DSA Exam</h3>
          <button>Edit</button>
          <button style={{ marginLeft: 10 }}>Delete</button>
        </div>
      </div>
    </TeacherLayout>
  );
}
