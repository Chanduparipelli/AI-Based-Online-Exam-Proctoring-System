import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function normalizeLog(log) {
  const studentName =
    log.student_name ||
    log.student ||
    log.student_fullname ||
    "Unknown Student";

  const studentEmail = log.student_email || log.email || "N/A";

  const examTitle =
    log.exam_title ||
    log.exam_name ||
    log.exam ||
    "Unknown Exam";

  const event =
    log.event ||
    log.event_type ||
    log.reason ||
    "N/A";

  const ts = log.timestamp || log.time || log.created_at || null;
  const time = ts ? new Date(ts).toLocaleString() : "N/A";

  const severity =
    log.severity ||
    log.level ||
    (event.toLowerCase().includes("phone")
      ? "high"
      : event.toLowerCase().includes("tab")
      ? "medium"
      : "low");

  return {
    id: log._id || log.id || Math.random().toString(36).slice(2),
    studentName,
    studentEmail,
    examTitle,
    event,
    time,
    severity,
    raw: log,
  };
}

export default function ProctorLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const headers = {};
      const token = getToken();
      if (token) headers.Authorization = "Bearer " + token;
      const res = await fetch(`${API}/teacher/proctor-logs`, { headers });
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map(normalizeLog);
      setLogs(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function filterLogs() {
    return logs.filter((l) => {
      if (eventFilter !== "all") {
        if (eventFilter === "phone" && !l.event.toLowerCase().includes("phone")) {
          return false;
        }
        if (eventFilter === "tab" && !l.event.toLowerCase().includes("tab")) {
          return false;
        }
        if (eventFilter === "face" && !l.event.toLowerCase().includes("face")) {
          return false;
        }
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.studentName.toLowerCase().includes(q) ||
        l.studentEmail.toLowerCase().includes(q) ||
        l.examTitle.toLowerCase().includes(q) ||
        l.event.toLowerCase().includes(q)
      );
    });
  }

  const filteredLogs = filterLogs();

  function severityClass(severity) {
    const s = (severity || "").toLowerCase();
    if (s === "high") return "log-sev-high";
    if (s === "medium") return "log-sev-med";
    return "log-sev-low";
  }

  return (
    <div className="t-panel">
      <div className="t-panel-header">
        <div>
          <h2 className="t-panel-title">AI Proctor Logs</h2>
          <div className="t-panel-sub">
            All suspicious activities across exams, grouped by student and time.
          </div>
        </div>
        <div className="log-filter-bar">
          <input
            className="log-search"
            placeholder="Search by student, exam, or event…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="log-select"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="all">All events</option>
            <option value="phone">Phone usage</option>
            <option value="tab">Tab switch</option>
            <option value="face">Face issues</option>
          </select>
          <button className="t-btn small" onClick={fetchLogs}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="log-table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Exam</th>
              <th>Event</th>
              <th>Severity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="log-row-empty">
                <td colSpan={6}>Loading logs…</td>
              </tr>
            )}

            {!loading && filteredLogs.length === 0 && (
              <tr className="log-row-empty">
                <td colSpan={6}>No logs match this filter.</td>
              </tr>
            )}

            {!loading &&
              filteredLogs.map((log) => (
                <tr key={log.id} className="log-row">
                  <td className="log-cell-name">{log.studentName}</td>
                  <td className="log-cell-email">{log.studentEmail}</td>
                  <td className="log-cell-exam">{log.examTitle}</td>
                  <td className="log-cell-event">{log.event}</td>
                  <td className="log-cell-sev">
                    <span className={`log-severity-badge ${severityClass(log.severity)}`}>
                      {log.severity || "low"}
                    </span>
                  </td>
                  <td className="log-cell-time">{log.time}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="log-footer">
        <span>Total logs: {logs.length}</span>
        <span>Showing: {filteredLogs.length}</span>
      </div>
    </div>
  );
}
