# 🌐 NexusMind AI
### Production-Ready Multimodal AI Knowledge Assistant

[![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Node%20%7C%20Gemini%20AI-0f172a.svg)](https://github.com)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-5%2F5%20Passing-emerald.svg)](backend/tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Tagline**: One Workspace. Every Format. Connected Intelligence.

---

## 📌 1. Problem Statement
Modern users interact with information scattered across fragmented modalities:
* **Text Documents & PDF Textbooks**: Chapter guides, technical logs, research papers.
* **Handwritten Notes & Diagrams**: Chalkboard captures, whiteboard sketches, graphs.
* **Audio Recordings**: Classroom lectures, interviews, voice memos.
* **Video Demonstrations**: Lab experiments, recorded meetings, tutorials.

Traditional software evaluates these formats in isolation. Text models read PDFs without verifying acoustic speech, while vision models inspect photographs without checking telemetry timestamps. This blind spot forces users to manually search, listen, and compare across tools—wasting time and overlooking critical cross-modal connections.

---

## 💡 2. Proposed Solution
**NexusMind AI** creates a unified multimodal knowledge workspace. Users upload documents, imagery, audio, and video into one intelligent assistant. Powered by **Google Gemini 1.5 Flash**, NexusMind AI extracts, correlates, and queries data across modalities—providing grounded answers with verifiable citations (`Biology_Chapter_2.pdf — Page 5`, `Lecture_Recording.mp3 — Transcript around 02:35`).

---

## 🚀 3. Key Features
1. **Multimodal Ingestion Hub**:
   * Drag-and-drop file ingestion via **Multer** for PDF, DOCX, TXT, Images, Audio, and Video (up to 100MB).
   * **In-Browser Microphone Audio Recording** with HTML5 MediaRecorder and live animated waveform.
   * **In-Browser Camera Snapshot Capture** with webcam streaming and canvas snapshot.
2. **Grounded RAG Assistant**:
   * Multi-turn chat strictly grounded in retrieved workspace chunks.
   * Clickable citation badges that open a **Source Inspector** displaying exact page numbers, audio timestamps, and extracted text.
3. **Connected Intelligence (Hackathon Differentiator)**:
   * Cross-modal comparative reasoning across Documents, Images, Audio, and Video.
   * Identifies common concepts, surfaces contradictions, and compiles revision summaries.
4. **Smart Content Studio**:
   * Generates practice quizzes (MCQs and short-answers with explanations), study notes, summaries, and action item checklists.
5. **Knowledge Library & Global Search**:
   * Search across document text chunks, image descriptions, audio transcripts, and video frame descriptions.
6. **Evaluator Demo Mode**:
   * Preloaded educational showcase with a physics PDF chapter, handwritten diagram image, audio lecture, and lab experiment video for instant 1-click evaluation.

---

## 🏗️ 4. System Architecture

```
[ Frontend: React 18 + Vite + TypeScript + Tailwind CSS ]
                         │
                    HTTP / REST
                         ▼
[ Backend: Node.js + Express + TypeScript + Zod Validation ]
    ├── Authentication: JWT in HttpOnly Cookie + bcryptjs
    ├── File Pipeline: Multer (PDF, DOCX, TXT, Images, Audio, Video)
    ├── Storage Service: Supabase Storage + Local Fallback
    ├── Database: Supabase PostgreSQL + Persistent Embedded Engine
    ├── Retrieval Engine: Full-Text Keyword Ranking & Grounding
    └── AI Engine: Google Gemini 1.5 Flash API (Backend-Only Keys)
```

---

## 🛠️ 5. Technology Stack Compliance

| Component | Technology | Implementation Detail |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript | Responsive, clean SaaS design with Tailwind CSS, Lucide React, React Router v6, Recharts |
| **Backend** | Node.js v24, Express 4.21 | Modular REST architecture (`controllers/`, `middleware/`, `routes/`, `services/`) |
| **Auth & Security** | JWT, bcryptjs | 10 salt rounds, HttpOnly cookie sessions, protected route middleware |
| **Validation & Upload** | Zod v3, Multer | Strict schema validation, file size & MIME type validation |
| **Database & Storage** | Supabase PostgreSQL + Storage | SQL migrations, private bucket storage + zero-config embedded persistence fallback |
| **Artificial Intelligence** | Google Gemini 1.5 Flash | Official `@google/generative-ai` SDK, prompt injection defense, backend-only keys |

---

## ⚡ 6. Installation & Execution Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher; tested on v20 & v24)
* `npm` (v9 or higher)

### Option A: 1-Click Startup (Recommended)
```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Start Backend (:5000) and Frontend (:5173) concurrently
npm run dev
```

### Option B: Separate Terminal Startup

#### 1. Backend Service
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🧪 7. Running Automated Tests
The repository includes a complete automated test suite verifying password hashing, JWT token lifecycle, database persistence, RAG keyword search, and the Connected Intelligence engine:
```bash
cd backend
npm test
```
*Output: 5 tests passed (100% success).*

---

## 🔑 8. Evaluator Demo Credentials

Open [http://localhost:5173](http://localhost:5173) and click **"⚡ Auto-Fill"** on the login page:
* **Email**: `demo@nexusmind.ai`
* **Password**: `Password123!`

The server automatically pre-seeds the featured showcase workspace:
> **Showcase: Newtonian Dynamics Multi-Source Synthesis**  
> Ingests a physics chapter (`.pdf`), handwritten notes diagram (`.png`), audio lecture recording (`.wav`), and lab experiment video (`.mp4`) demonstrating true cross-modal understanding.

---

## 🌐 9. Production Deployment Guide
Full production deployment guides for **Vercel** (Frontend), **Render / Railway** (Backend), and **Supabase** (Database & Storage) are available in [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

---

## 📹 10. Hackathon Video Presentation Script
A structured 3 to 5-minute video demonstration script with timestamp markers and narrator voiceover lines is available in [docs/DEMO_VIDEO_SCRIPT.md](docs/DEMO_VIDEO_SCRIPT.md).

---

## 📬 11. Postman / Bruno API Test Collection
An importable Postman collection covering all endpoints is available in [docs/POSTMAN_COLLECTION.json](docs/POSTMAN_COLLECTION.json).

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
