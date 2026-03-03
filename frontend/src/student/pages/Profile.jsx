import React, { useEffect, useState } from "react";
import StudentLayout from "../layout/StudentLayout";

const API = "http://127.0.0.1:8000";

export default function Profile() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  useEffect(() => {
    // optionally fetch fresh profile if you have endpoint
  }, []);

  return (
    <StudentLayout>
      <div className="card">
        <h2>Profile</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <div><strong>Name:</strong> {user?.username || user?.name || "Student User"}</div>
          <div><strong>Email:</strong> {user?.email || "student@gmail.com"}</div>
          <div><strong>Role:</strong> {user?.role || "student"}</div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => alert("Edit profile flow not implemented yet")}>Edit Profile</button>
        </div>
      </div>
    </StudentLayout>
  );
}
