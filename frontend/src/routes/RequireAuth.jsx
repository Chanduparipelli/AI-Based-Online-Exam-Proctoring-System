import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireAuth({ children, role }) {
  const { user, ready } = useAuth();

  if (!ready) return <div style={{ padding: 30 }}>Loading...</div>;

  if (!user) return <Navigate to="/" replace />;

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    const matches = allowed.map(r => r.toString().toLowerCase()).includes((user.role || "").toString().toLowerCase());
    if (!matches) return <Navigate to="/" replace />;
  }

  return children;
}
