Project Overview

The AI-Based Online Exam and Proctoring System is a full-stack web application designed to conduct secure and scalable online examinations with real-time AI monitoring. The system integrates exam management features with computer vision-based proctoring to ensure fairness, transparency, and integrity in remote assessments.

The platform provides separate dashboards for students and teachers. Students can attempt exams in a monitored environment, while teachers can create exams, manage questions, review submissions, and analyze proctoring reports. The system uses real-time webcam monitoring to detect suspicious activities and automatically logs violations for instructor review.

Key Features
---------------------
Student Features
Students can log in securely and access their dashboard.
They can view upcoming exams, attempt exams within a timed environment, and check results.
During the exam, the system monitors face visibility and detects unauthorized devices.
All detected violations are logged and associated with the exam session.

Teacher Features
----------------------------------
Teachers can create exams and add questions.
They can manage exams and view student submissions.
AI-generated proctoring logs are available for review.
The dashboard provides structured reports for evaluation and decision-making.

AI Proctoring Features
-------------------------------------
Real-time face detection using computer vision techniques.
Detection of multiple faces or absence of face during examination.
Object detection using a YOLO-based model to identify unauthorized devices such as mobile phones.
Automatic violation logging with timestamps and student details.
WebSocket-based real-time communication for low-latency monitoring.

System Architecture
-------------------------
The system follows a modular client-server architecture.

Frontend
Built using React.
Provides separate panels for students and teachers.
Handles exam interface, dashboards, and communication with backend APIs.

Backend
Built using FastAPI.
Manages authentication, exam logic, proctoring data, and API endpoints.
Processes real-time monitoring data and stores violation logs.

Database
MongoDB is used for storing user details, exams, submissions, and proctoring logs.

Technology Stack
----------------------------------
Frontend
React
JavaScript
CSS

Backend
FastAPI
Uvicorn
Python

Database
MongoDB
Motor or PyMongo

AI and Computer Vision
OpenCV
MediaPipe
YOLO object detection
NumPy

Real-Time Communication
WebSockets

Project Structure
---------------------------
Backend
main.py handles application entry point.
routes folder contains API route definitions for student and teacher modules.
models folder contains database schemas.
services folder includes proctoring logic and detection modules.
database folder handles database connection.

Frontend
src folder contains all frontend code.
student folder includes student pages such as Dashboard, ExamPage, Results, and LearnPage.
teacher folder includes TeacherDashboard, CreateExam, AddQuestions, and ProctorLogs.
layout folder contains layout components like Sidebar and Topbar.
App.js manages routing.

How to Run the Project
--------------------------------------
Backend
Install required Python packages from requirements.txt.
Start the server using uvicorn main:app --reload.

Frontend
Install dependencies using npm install.
Start the React application using npm start.

System Requirements
---------------------------------------
Python 3.10 or higher
Node.js and npm
MongoDB installed locally or configured via cloud database
Webcam for real-time monitoring

Performance Highlights
-------------------------------------
The system demonstrates improved face detection accuracy, reliable violation logging, and reduced response time during real-time monitoring. It supports multiple concurrent users and ensures stable communication with minimal latency.

Future Enhancements
--------------------------------------
Integration of audio monitoring for enhanced proctoring.
Advanced behavior analytics using machine learning.
Scalability improvements for large institutional deployment.
Enhanced analytics dashboard for instructors.

Conclusion
---------------------------------------
The AI-Based Online Exam and Proctoring System provides a secure, efficient, and scalable solution for conducting online examinations. By integrating real-time computer vision techniques with structured logging and reporting, the system strengthens academic integrity while maintaining usability and performance.
