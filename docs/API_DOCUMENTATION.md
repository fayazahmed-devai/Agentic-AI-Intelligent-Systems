# NexusMind AI — REST API Documentation

Base URL: `http://localhost:5000/api` (Local) / `https://your-backend.onrender.com/api` (Production)

Authentication: `Authorization: Bearer <JWT_TOKEN>` or HttpOnly cookie `nexusmind_token`.

---

## 1. System Health
### `GET /health`
Returns system status, configured AI model, and storage provider.
* **Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "NexusMind AI — Production Multimodal Knowledge Assistant",
  "timestamp": "2026-11-14T05:29:16.670Z",
  "geminiConfigured": true,
  "geminiModel": "gemini-1.5-flash",
  "supabaseConfigured": true
}
```

---

## 2. Authentication
### `POST /auth/register`
Creates a new investigator user account.
* **Payload**:
```json
{
  "full_name": "Dr. Alan Turing",
  "email": "turing@nexusmind.ai",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "terms": true
}
```

### `POST /auth/login`
Authenticates credentials and establishes session.
* **Payload**:
```json
{
  "email": "demo@nexusmind.ai",
  "password": "Password123!"
}
```

### `GET /auth/me` *(Protected)*
Retrieves current authenticated profile.

### `POST /auth/logout`
Clears session cookie and invalidates token.

---

## 3. Files & Multimodal Ingestion
### `POST /files/upload` *(Protected, Multipart)*
Uploads up to 10 files (PDF, DOCX, TXT, Images, Audio, Video).
* **Body Form Data**: `files` (Binary array)
* **Response**: Array of created file records with `processing_status: "Queued"`.

### `GET /files` *(Protected)*
Lists all user files with optional query filters:
* Query params: `modality=document|image|audio|video|text`, `status=Processed|Processing|Failed`, `search=keyword`.

### `GET /files/:id` *(Protected)*
Returns metadata and all extracted text chunks / analyses.

### `GET /files/:id/stream` *(Protected)*
Streams media file with HTTP `Range` request support for smooth audio and video scrubbing.

### `DELETE /files/:id` *(Protected)*
Deletes file from storage and database.

### `POST /files/:id/process` *(Protected)*
Restarts asynchronous multimodal processing for a file.

---

## 4. Artificial Intelligence & Connected Intelligence
### `POST /ai/chat` *(Protected)*
Grounded RAG question answering across workspace sources.
* **Payload**:
```json
{
  "message": "Explain Newton's third law using all files.",
  "conversationId": "optional-uuid",
  "targetFileIds": []
}
```

### `POST /ai/connected-intelligence` *(Protected)*
Cross-modal synthesis connecting Documents, Images, Audio, and Video.
* **Payload**:
```json
{
  "topic": "Newtonian Dynamics & Experimental Verification",
  "fileIds": []
}
```

### `POST /ai/generate-content` *(Protected)*
Content Studio generation.
* **Payload**:
```json
{
  "type": "questions" | "summary" | "study_notes" | "action_items" | "comparison",
  "topic": "Newton's Laws",
  "fileIds": []
}
```

---

## 5. Global Search & Dashboard
### `GET /search?q=query` *(Protected)*
Searches across document text chunks, image descriptions, audio transcripts, and video frames.

### `GET /dashboard/stats` *(Protected)*
Returns live statistics: total files, processed files, storage bytes, questions asked, and modality counts.

### `GET /dashboard/activity` *(Protected)*
Returns recent upload, question, and generation activities.
