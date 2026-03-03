import React, { useState } from "react";
import "../styles/Login.css";

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert(`Logging in...\nEmail: ${email}`);
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="login-title">Welcome Back</h2>

        <input
          type="text"
          placeholder="Enter Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <div className="login-bottom">
          New here?{" "}
          <a onClick={onSwitchToRegister}>Create an Account</a>
        </div>

      </div>
    </div>
  );
}
