# NexusMind AI — 3–5 Minute Hackathon Video Script

**Target Duration**: 3 to 5 minutes  
**Format**: Screen capture with voiceover narration  
**Demo Account**: `demo@nexusmind.ai` / `Password123!`  

---

## Script & Timestamp Breakdown

### 0:00–0:30 | Scene 1: Introduction & Problem Statement
* **Visual**: Show landing page hero section: *"One Workspace. Every Format. Connected Intelligence."*
* **Voiceover**:
  > "Hello hackathon evaluators! Today, learners, researchers, and professionals juggle information across fragmented media—textbook PDFs, handwritten notes, lecture recordings, and lab videos.
  > 
  > Current AI tools process these in isolation: text LLMs can read a PDF, but they cannot verify whether a professor's spoken lecture adds crucial practical context, or if a video demonstration matches the written theory.
  > 
  > We built **NexusMind AI** to bridge this gap: a production-grade, grounded multimodal knowledge assistant that genuinely connects text, imagery, audio, and video into unified, verifiable intelligence."

---

### 0:30–1:00 | Scene 2: Authentication & Personalized Dashboard
* **Visual**: Click "⚡ Explore Demo (1-Click)" on the landing page. Sign in instantly and navigate to the Dashboard. Point out the live metric cards (Total Uploads, Processed Files, Storage Used, Questions Asked) and the Modality Breakdown chart.
* **Voiceover**:
  > "Logging in through our secure JWT authentication system, we enter the personalized dashboard.
  > 
  > Every statistic here is derived in real-time from our PostgreSQL database—tracking uploaded files, processed modalities, storage usage, and recent activities.
  > 
  > Notice our workspace is preloaded with 4 multimodal assets representing an educational investigation into Newtonian Dynamics."

---

### 1:00–1:45 | Scene 3: Multimodal Ingestion Hub
* **Visual**: Click the **"Upload Files"** button to open the modal. Show the three tabs:
  1. File Dropzone (PDF, DOCX, TXT, Images, Audio, Video up to 100MB).
  2. Live Browser Microphone Recording.
  3. Live Camera Snapshot Capture.
* **Voiceover**:
  > "NexusMind AI's ingestion hub supports all major file formats via Multer. 
  > 
  > Users can drag and drop lecture PDFs, record spoken audio thoughts directly through their browser microphone with real-time waveform visualizers, or snap photos of handwritten chalkboard notes using their webcam."

---

### 1:45–2:30 | Scene 4: Knowledge Library & Media Players
* **Visual**: Navigate to `/library`. Filter by modality (Documents, Images, Audio, Video). Open `Prof_Physics_Lecture.mp3` in the Audio Waveform Scrubber and play a few seconds; toggle playback rate to 1.5x. Open `Lab_Pendulum_Experiment.mp4` and jump to keyframe bookmarks.
* **Voiceover**:
  > "In the Knowledge Library, every ingested artifact is cataloged with strict row-level user ownership.
  > 
  > Our built-in forensic media players allow researchers to scrub audio recordings at up to 2x speed, inspect extracted transcripts, and jump directly to keyframe timestamps in video demonstrations."

---

### 2:30–3:30 | Scene 5: Connected Intelligence (Our Main Differentiator)
* **Visual**: Click **"Connected Intelligence"** in the sidebar. Run the analysis on *"Newtonian Dynamics & Experimental Verification"*. The structured synthesis appears.
* **Voiceover**:
  > "Now for our highlight feature: **Connected Intelligence**.
  > 
  > Instead of running four separate chats, NexusMind AI synthesizes evidence across all four modalities simultaneously!
  > 
  > Notice the structured breakdown:
  > * The theoretical derivation is extracted from **Page 4 of the PDF**.
  > * The free-body force vectors are corroborated by the **handwritten diagram image**.
  > * Real-world air resistance nuances are pulled from the **lecture audio transcript around 01:14**.
  > * The empirical oscillation decay is proven by the **video experiment at frame 01:20**.
  > 
  > The engine explicitly detects terminology differences between theoretical math and spoken speech, producing a unified revision summary."

---

### 3:30–4:15 | Scene 6: Grounded AI Assistant & Clickable Citations
* **Visual**: Navigate to `/chat`. Ask: *"What formula was derived on page 4, and how does it relate to the audio lecture?"*. Point to the grounded answer and click the citation pill: `Newtonian_Dynamics_Chapter4.pdf — Page 4`. The Source Citation Slide-Over drawer appears.
* **Voiceover**:
  > "In our AI Assistant, every factual claim is strictly grounded. Notice the clickable citation tags: clicking a citation instantly opens our Source Inspector, revealing the exact page number, transcript timestamp, and extracted chunk.
  > 
  > Zero hallucinations. Zero fake citations."

---

### 4:15–4:45 | Scene 7: Content Studio & Global Search
* **Visual**: Switch to `/content-studio`. Generate 5 practice quiz questions from the uploaded materials. Then navigate to `/search` and search for *"damping coefficient"*, displaying instant cross-modal matches.
* **Voiceover**:
  > "Our Content Studio instantly converts uploaded materials into practice quizzes with explanations, revision flashcards, and actionable checklists.
  > 
  > Global Multimodal Search allows users to query concepts across documents, audio transcripts, and video frames simultaneously."

---

### 4:45–5:00 | Scene 8: Closing
* **Visual**: Return to the landing page or documentation view.
* **Voiceover**:
  > "Built with React, Vite, TypeScript, Express, JWT, Zod, Multer, Supabase, and Google Gemini—NexusMind AI turns fragmented media into connected intelligence.
  > 
  > Thank you for evaluating NexusMind AI!"
