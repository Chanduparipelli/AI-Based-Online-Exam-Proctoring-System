import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./routes/RequireAuth";
import AuthPage from "./auth/AuthPage.jsx";

import Dashboard from "./student/pages/Dashboard";
import UpcomingExams from "./student/pages/UpcomingExams";
import ExamInstructions from "./student/pages/ExamInstructions";
import ExamPage from "./student/pages/ExamPage";
import ExamFinish from "./student/pages/ExamFinish";
import Results from "./student/pages/Results";
import Profile from "./student/pages/Profile";
import LearnPage from "./student/pages/LearnPage";


import TeacherLayout from "./teacher/layout/TeacherLayout";

import TeacherDashboard from "./teacher/pages/TeacherDashboard";
import CreateExam from "./teacher/pages/CreateExam";
import AddQuestions from "./teacher/pages/AddQuestions";
import ViewExams from "./teacher/pages/ViewExams";
import ViewResults from "./teacher/pages/ViewResults";
import ProctorLogs from "./teacher/pages/ProctorLogs";
import TeacherProfile from "./teacher/pages/Profile";

import StudentSubmissions from "./teacher/pages/StudentSubmissions";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ====================== LOGIN ====================== */}
          <Route path="/" element={<AuthPage />} />

          {/* ====================== STUDENT ====================== */}
          <Route
            path="/student/dashboard"
            element={<RequireAuth role="student"><Dashboard /></RequireAuth>}
          />

          <Route
            path="/student/upcoming-exams"
            element={<RequireAuth role="student"><UpcomingExams /></RequireAuth>}
          />

          <Route
  path="/student/exam-instructions"
  element={<ExamInstructions />}
/>
<Route path="/student/learn/:topic" element={<LearnPage />} />


          <Route
            path="/student/exam"
            element={<RequireAuth role="student"><ExamPage /></RequireAuth>}
          />

          <Route
            path="/student/exam-finish"
            element={<RequireAuth role="student"><ExamFinish /></RequireAuth>}
          />

          <Route
            path="/student/results"
            element={<RequireAuth role="student"><Results /></RequireAuth>}
          />

          <Route
            path="/student/profile"
            element={<RequireAuth role="student"><Profile /></RequireAuth>}
          />

          {/* ====================== ✅ TEACHER (LAYOUT FIXED) ====================== */}

          <Route
            path="/teacher/dashboard"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <TeacherDashboard />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/create-exam"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <CreateExam />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/add-questions"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <AddQuestions />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/view-exams"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <ViewExams />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/results"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <ViewResults />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/proctor-logs"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <ProctorLogs />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          {/* ✅✅✅ NEW: STUDENT SUBMISSIONS ROUTE */}
          <Route
            path="/teacher/submissions"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <StudentSubmissions />
                </TeacherLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/teacher/profile"
            element={
              <RequireAuth role="teacher">
                <TeacherLayout>
                  <TeacherProfile />
                </TeacherLayout>
              </RequireAuth>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
