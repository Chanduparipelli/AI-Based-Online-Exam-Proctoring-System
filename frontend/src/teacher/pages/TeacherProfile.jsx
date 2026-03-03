import React from "react";
import TeacherLayout from "../layout/TeacherLayout";

export default function TeacherProfile() {
  return (
    <TeacherLayout>
      <div className="card">
        <h2>Profile</h2>
        <p>Name: Teacher User</p>
        <p>Email: teacher@gmail.com</p>
        <p>Department: CSE</p>

        <button>Edit Profile</button>
      </div>
    </TeacherLayout>
  );
}
