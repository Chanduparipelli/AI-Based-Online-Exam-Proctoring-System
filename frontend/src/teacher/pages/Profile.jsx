import Sidebar from "../components/Sidebar";
import React from "react";

export default function Profile() {
  return (
    <div style={{ marginLeft: "260px", padding: 30 }}>
      <Sidebar />
      <h2>Your Profile</h2>

      <p>Name: Teacher</p>
      <p>Email: teacher@example.com</p>
    </div>
  );
}
