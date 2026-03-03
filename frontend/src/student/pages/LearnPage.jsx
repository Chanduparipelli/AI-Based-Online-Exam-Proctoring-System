import React, { useEffect, useState } from "react";
import StudentLayout from "../layout/StudentLayout";
import { useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function LearnPage() {
  const { topic } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [topic]);

  async function fetchContent() {
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API}/student/course-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ topic })
      });

      const data = await res.json();
      setContent(data.content || "No content generated");
    } catch {
      setContent("Failed to load AI content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <StudentLayout>
      <div className="gradient-page">
        <h2>📘 {topic}</h2>

        {loading ? (
          <p>🤖 AI is preparing your lesson...</p>
        ) : (
          <div className="course-content">
            {content}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
