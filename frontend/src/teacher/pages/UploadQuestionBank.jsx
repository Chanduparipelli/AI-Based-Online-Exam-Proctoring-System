import React from "react";
import TeacherLayout from "../layout/TeacherLayout";

export default function UploadQuestionBank() {
  return (
    <TeacherLayout>
      <div className="card">
        <h2>Upload Question Bank</h2>

        <input type="file" />

        <button style={{ marginTop: 15 }}>Upload</button>

        <p style={{ marginTop: 10 }}>
          Supported Formats: PDF, Word, TXT
        </p>
      </div>
    </TeacherLayout>
  );
}
