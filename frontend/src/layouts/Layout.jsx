// src/layouts/Layout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import "./layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <main className="app-content">
        <div className="topbar">
          <div className="topbar-left">
            <h3 style={{ margin: 0 }}>Exam Portal</h3>
          </div>
          <div className="topbar-right">
            <button
              className="btn ghost"
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
