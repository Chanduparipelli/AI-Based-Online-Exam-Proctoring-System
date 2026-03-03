import React, { useEffect, useState } from "react";

export default function ViewExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function loadExams() {
      const res = await fetch("http://127.0.0.1:8000/teacher/exams");
      const data = await res.json();
      setExams(data);
    }
    loadExams();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>All Exams</h2>

      {exams.map((exam) => (
        <div key={exam._id} style={{ padding: 10, border: "1px solid #ccc", marginBottom: 10 }}>
          <h3>{exam.title}</h3>
          <p>Subject: {exam.subject}</p>
          <p>Total Marks: {exam.total_marks}</p>
          <p>Duration: {exam.duration} minutes</p>
        </div>
      ))}
    </div>
  );
}
