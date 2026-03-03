// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("access_token");
      const u = localStorage.getItem("user");
      if (t && u) setUser(JSON.parse(u));
      else setUser(null);
    } catch (e) {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  function saveSession(token, userObj) {
    if (token) localStorage.setItem("access_token", token);
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj || null);
  }

  function clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, saveSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
