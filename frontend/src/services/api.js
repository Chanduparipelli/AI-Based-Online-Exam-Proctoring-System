// src/services/api.js
const API_BASE = "http://127.0.0.1:8000";

export async function post(path, body = {}, opts = {}) {
  return request("POST", path, body, opts);
}

export async function get(path, opts = {}) {
  return request("GET", path, null, opts);
}

export async function request(method, path, body = null, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  if (!headers["Content-Type"] && (method === "POST" || method === "PUT" || method === "PATCH")) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body && headers["Content-Type"] === "application/json" ? JSON.stringify(body) : body,
  });

  let data = null;
  const text = await res.text().catch(() => null);
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const err = new Error(data?.detail || data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
