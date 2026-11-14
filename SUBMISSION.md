# NexusMind AI — Hackathon Submission Document

**Application Name**: NexusMind AI  
**Tagline**: One Workspace. Every Format. Connected Intelligence.  
**Tech Stack**: React 18, Vite 5, TypeScript, Tailwind CSS, Node.js v24, Express, JWT, bcrypt, Zod, Multer, Supabase PostgreSQL & Storage, Google Gemini 1.5 Flash.

---

## 1. Problem Statement
Knowledge workers, researchers, and students routinely interact with information dispersed across fragmented media formats:
* **Documents & Textbooks** (PDF, DOCX, TXT)
* **Handwritten Notes & Diagrams** (JPG, PNG, WEBP)
* **Spoken Discussions & Lectures** (MP3, WAV, M4A)
* **Demonstrations & Experiments** (MP4, MOV, WEBM)

Traditional software processes these modalities in silos: text models read documents without checking audio, while vision models inspect photographs without correlating timestamps. This causes severe knowledge fragmentation, lost productivity, and overlooked contradictions between sources.

---

## 2. Proposed Solution
**NexusMind AI** provides a unified cognitive workspace where users upload documents, imagery, audio recordings, and videos into one intelligent hub. Instead of treating each file independently, NexusMind AI extracts, synchronizes, and connects evidence across all modalities.

### Core Capabilities:
1. **Multimodal Ingestion Hub**: Drag-and-drop file upload via Multer, in-browser live microphone audio recording, and live camera snapshot capture.
2. **Grounded RAG Assistant**: Multi-turn chat strictly grounded in workspace materials with exact source citations (`Biology_Chapter_2.pdf — Page 5`, `Lecture_Recording.mp3 — Transcript around 02:35`).
3. **Connected Intelligence (Key Innovation)**: Synthesizes evidence across all 4 modalities simultaneously—identifying common concepts, detecting contradictions, and generating structured combined explanations.
4. **Content Studio**: Generates practice quiz questions with explanations, topic-wise study notes, and action item checklists.
5. **Knowledge Library & Global Search**: Full-text search across document chunks, image descriptions, audio transcripts, and video frames.

---

## 3. Key Innovation: Connected Intelligence
The defining innovation of NexusMind AI is **cross-modal reasoning**. When asked to explain a topic using all four uploaded modalities (e.g. Newtonian Dynamics across a PDF chapter, a handwritten diagram, an audio lecture, and a lab experiment video), the engine:
1. Derives theoretical equations from the **PDF textbook**.
2. Corroborates opposing force vectors from the **handwritten diagram image**.
3. Integrates practical air resistance remarks from the **audio recording at timestamp 01:14**.
4. Validates experimental oscillation damping from the **video stream at frame 01:20**.
5. Explicitly notes discrepancies (e.g. theoretical formulas assume frictionless conditions, whereas audio and video document fluid damping).

---

## 4. Acceptance Checklist & Verification

* [x] **Real User Authentication**: Registration with password strength meter, bcrypt hashing (10 rounds), JWT in HttpOnly cookies, session persistence, and logout.
* [x] **File Processing**: Real asynchronous pipeline for PDF, DOCX, TXT, Images, Audio, and Video with statuses `Uploaded`, `Queued`, `Processing`, `Processed`, and `Failed`.
* [x] **Multimodal Intelligence**: Google Gemini 1.5 Flash integration with backend-only environment variable keys.
* [x] **Grounded RAG & Citations**: Zero hallucinated citations; all citations link to actual extracted records.
* [x] **Connected Intelligence**: Cross-modal comparative reasoning across documents, images, audio, and video.
* [x] **Content Studio**: Smart summary, revision notes, quiz question generation, and action item checklists.
* [x] **Knowledge Library & Search**: Full library filtering and global cross-modal search.
* [x] **Security & Privacy**: Row-level user ownership, parameter validation via Zod, secure CORS, and safe file handling.
* [x] **1-Click Demo for Evaluators**: Preloaded with educational showcase files and instant auto-fill demo account (`demo@nexusmind.ai / Password123!`).

---

## 5. Quick-Start Execution Commands
```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Start Backend (:5000) and Frontend (:5173) concurrently
npm run dev

# 3. Access web application
# Open http://localhost:5173 in any modern browser
```
