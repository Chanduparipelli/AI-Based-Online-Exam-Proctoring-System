import Sidebar from "../components/Sidebar";
import React from "react";

export default function ViewResults() {
  return (
    <div style={{ marginLeft: "260px", padding: 30 }}>
      <Sidebar />
      <h2>Student Results</h2>

      <div style={{ padding: 15, background: "#fff", width: 400 }}>
        <b>John Doe</b> — 90/100
      </div>

      <div style={{ padding: 15, background: "#fff", width: 400, marginTop: 10 }}>
        <b>Sarah Lee</b> — 76/100
      </div>
    </div>
  );
}
