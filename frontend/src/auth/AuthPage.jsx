import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./auth.css";

const API = "http://127.0.0.1:8000";

function parseJwt(token) {
  try {
    if (!token) return null;
    const base = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base));
  } catch {
    return null;
  }
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [suEmail, setSuEmail] = useState("");
  const [suUser, setSuUser] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suRole, setSuRole] = useState("student");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginUser(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      const token = data.access_token;
      const decoded = parseJwt(token);
      let userRole = (data.role || decoded?.role || role).toLowerCase();

      const userObj = {
        id: data.user_id || decoded?.sub,
        email: data.email || decoded?.email,
        role: userRole
      };

      saveSession(token, userObj);

      if (userRole === "teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function signupUser(e) {
    e.preventDefault();
    setError("");

    if (suPass !== suConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: suEmail,
          username: suUser,
          password: suPass,
          role: suRole,
        }),
      });

      if (!res.ok) {
        setError("Signup failed");
        return;
      }

      alert("Signup successful. Please login.");
      setMode("login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      {/* ✅✅✅ PERFECTLY CENTERED HERO SECTION ✅✅✅ */}
      <div className="auth-hero-top centered">
        <h1>AI-Based Online Exam & Proctoring System</h1>
        <p className="hero-sub">Secure • Smart • Automated Examination Platform</p>

        <p className="hero-desc">
          Take online exams with real-time AI monitoring, ensuring complete fairness and transparency.
          Our system uses face detection, phone detection, tab-switch tracking, and live behavior analysis
          to maintain exam integrity.
        </p>

        <p className="hero-desc faded">
          Built for Students & Teachers to experience next-generation digital examinations.
        </p>
      </div>

      {/* ✅ LOGIN CARD */}
      <div className="glass-card">
        {mode === "login" ? (
          <form onSubmit={loginUser}>
            <h2>Login</h2>

            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <button disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="switch" onClick={() => setMode("signup")}>
              No account? Sign up
            </p>
          </form>
        ) : (
          <form onSubmit={signupUser}>
            <h2>Create Account</h2>

            <select value={suRole} onChange={e => setSuRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <input placeholder="Email" value={suEmail} onChange={e => setSuEmail(e.target.value)} />
            <input placeholder="Username" value={suUser} onChange={e => setSuUser(e.target.value)} />
            <input placeholder="Password" type="password" value={suPass} onChange={e => setSuPass(e.target.value)} />
            <input placeholder="Confirm Password" type="password" value={suConfirm} onChange={e => setSuConfirm(e.target.value)} />

            <button disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="switch" onClick={() => setMode("login")}>
              Already registered? Login
            </p>
          </form>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <div className="features">

  {/* ✅ SECTION 1 - IMAGE LEFT */}
  <section className="feature-row">
    <img
      src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7"


      alt="AI Browser Monitoring"
      loading="lazy"
    />
    <div>
      <h2>AI Browser Monitoring</h2>
      <p>
        Our system continuously tracks tab switching, window changes, and unauthorized browser activity
        during exams. Any suspicious behavior is instantly detected and logged.
      </p>
      <p>
        This ensures students remain focused only on the examination window throughout the test.
      </p>
    </div>
  </section>

  {/* ✅ SECTION 2 - IMAGE RIGHT */}
  <section className="feature-row reverse">
    <div>
      <h2>Live Camera Proctoring</h2>
      <p>
        Real-time face detection, gaze tracking, and mobile phone detection are performed using AI.
        Any attempt to look away, involve another person, or use a mobile phone is immediately flagged.
      </p>
      <p>
        This creates a strict and fair examination environment similar to physical exam halls.
      </p>
    </div>
    <img
      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"

      alt="Live AI Proctoring"
      loading="lazy"
    />
  </section>

  {/* ✅ SECTION 3 - IMAGE LEFT */}
  <section className="feature-row">
    <img
      src="https://images.unsplash.com/photo-1647427060118-4911c9821b82?q=80&w=1200&auto=format&fit=crop"
      alt="Offline Protection & Sync"
      loading="lazy"
    />
    <div>
      <h2>Offline Protection & Auto Sync</h2>
      <p>
        Even when internet connectivity is lost, the system safely stores all activities and cheating logs
        locally on the device.
      </p>
      <p>
        Once the connection is restored, all data is automatically synchronized to the server.
      </p>
    </div>
  </section>

  {/* ✅ SECTION 4 - IMAGE RIGHT */}
  <section className="feature-row reverse">
    <div>
      <h2>Teacher Dashboard & AI Evaluation</h2>
      <p>
        Teachers can view student answers along with complete cheating activity reports in one place.
        AI-powered evaluation tools assist in faster and unbiased grading.
      </p>
      <p>
        This helps institutions maintain transparency and produce trustworthy exam results.
      </p>
    </div>
    <img
      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
      alt="Teacher Dashboard"
      loading="lazy"
    />
  </section>

</div>




    </div>
  );
}
