import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function CreateExam() {
  const navigate = useNavigate();

  const [examType, setExamType] = useState("mcq");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [duration, setDuration] = useState("");

  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [autoStatus, setAutoStatus] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [questionCount, setQuestionCount] = useState(10);

  function addQuestion() {
    if (examType === "mcq") {
      setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: 0 }]);
    } else if (examType === "descriptive") {
      setQuestions([...questions, { question: "" }]);
    } else {
      setQuestions([...questions, { question: "", input: "", output: "" }]);
    }
  }

  function updateQuestion(index, field, value) {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  }

  function updateOption(qIndex, oIndex, value) {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  }

  async function handleFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setPdfFile(file);
    setAutoStatus("✅ Syllabus PDF uploaded");
    e.target.value = "";
  }

  async function generateWithAI() {
    if (!pdfFile) {
      alert("Upload syllabus PDF first");
      return;
    }

    setAutoStatus("✨ AI generating questions from syllabus…");

    try {
      const token = localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("exam_type", examType);
      formData.append("file", pdfFile);
      formData.append("count", questionCount);

      const res = await fetch(`${API}/teacher/ai-generate-from-pdf`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData
      });

      const data = await res.json();
      const gen = Array.isArray(data.questions) ? data.questions : [];

      let mapped = [];

      if (examType === "mcq") {
        mapped = gen.map(q => ({
          question: q.question || "",
          options: q.options?.length === 4 ? q.options : ["", "", "", ""],
          correct: 0
        }));
      }
      else if (examType === "descriptive") {
        mapped = gen.map(q => ({ question: q.question || "" }));
      }
      else {
        mapped = gen.map(q => ({
          question: q.question || "",
          input: q.input || "",
          output: q.output || ""
        }));
      }

      setQuestions(mapped);
      setAutoStatus(`✅ Generated ${mapped.length} questions using AI`);
    } catch {
      setAutoStatus("❌ AI generation failed");
    }
  }

  async function createExam() {
    if (!title || !subject || !marks || !duration || questions.length === 0) {
      alert("Complete all fields and add at least one question");
      return;
    }

    const payload = {
      title,
      subject,
      total_marks: Number(marks),
      duration: Number(duration),
      type: examType,
      questions: questions.map(q => {
        if (examType === "mcq") {
          return {
            ...q,
            correct: Number(q.correct)
          };
        }
        return q;
      })
    };

    const token = localStorage.getItem("access_token");

    try {
      await fetch(`${API}/teacher/create-exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      });

      alert("✅ Exam Created Successfully");
      navigate("/teacher/dashboard");
    } catch {
      alert("❌ Exam creation failed");
    }
  }

  return (
    <div className="create-exam-container">
      <div className="create-exam-card">

        <div className="create-title">Create New Exam</div>

        <div className="exam-type-grid">
          <div className={`exam-type-card ${examType === "mcq" ? "active" : ""}`} onClick={() => setExamType("mcq")}>MCQ</div>
          <div className={`exam-type-card ${examType === "descriptive" ? "active" : ""}`} onClick={() => setExamType("descriptive")}>Descriptive</div>
          <div className={`exam-type-card ${examType === "coding" ? "active" : ""}`} onClick={() => setExamType("coding")}>Coding</div>
        </div>

        <div className="create-form">
          <input placeholder="Exam Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <input type="number" placeholder="Total Marks" value={marks} onChange={e => setMarks(e.target.value)} />
          <input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(e.target.value)} />

          <div className="create-upload-row">

            <label className="create-upload-label">
              Upload Syllabus PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} />
            </label>

            <input
              type="number"
              min="1"
              value={questionCount}
              onChange={e => setQuestionCount(e.target.value)}
              placeholder="No. of Questions"
              className="question-count-input"
            />

            <button className="ai-generate-btn" onClick={generateWithAI}>
              ✨ Ask AI
            </button>
          </div>

          {autoStatus && <div className="create-upload-status">{autoStatus}</div>}

          <h3>Questions</h3>

          {questions.map((q, index) => (
            <div key={index} className="dynamic-question-card">
              <textarea
                placeholder={`Question ${index + 1}`}
                value={q.question}
                onChange={e => updateQuestion(index, "question", e.target.value)}
              />

              {examType === "mcq" && (
                <>
                  {q.options.map((op, i) => (
                    <input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      value={op}
                      onChange={e => updateOption(index, i, e.target.value)}
                    />
                  ))}
                  <select value={q.correct} onChange={e => updateQuestion(index, "correct", Number(e.target.value))}>
                    <option value={0}>Correct Option 1</option>
                    <option value={1}>Correct Option 2</option>
                    <option value={2}>Correct Option 3</option>
                    <option value={3}>Correct Option 4</option>
                  </select>
                </>
              )}

              {examType === "coding" && (
                <>
                  <textarea placeholder="Sample Input" value={q.input} onChange={e => updateQuestion(index, "input", e.target.value)} />
                  <textarea placeholder="Expected Output" value={q.output} onChange={e => updateQuestion(index, "output", e.target.value)} />
                </>
              )}
            </div>
          ))}

          <button onClick={addQuestion}>+ Add Question</button>
          <button onClick={createExam}>Create Exam</button>
        </div>
      </div>
    </div>
  );
}
