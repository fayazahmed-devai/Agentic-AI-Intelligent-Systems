import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { config } from '../../config/env.js';

function createSampleWav(targetPath: string) {
  if (fs.existsSync(targetPath)) return;
  const sampleRate = 8000;
  const durationSec = 3;
  const numSamples = sampleRate * durationSec;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + numSamples);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34); // 8-bit
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);

  const freq = 440;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.floor(128 + 90 * Math.sin(2 * Math.PI * freq * t));
    buffer.writeUInt8(sample, headerSize + i);
  }

  fs.writeFileSync(targetPath, buffer);
}

function createSamplePng(targetPath: string) {
  if (fs.existsSync(targetPath)) return;
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM1JREFUeNrtwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GzYAAAE5p3GAAAAAAElFTkSuQmCC';
  fs.writeFileSync(targetPath, Buffer.from(pngBase64, 'base64'));
}

export const SampleDataService = {
  async seedDemoWorkspace(): Promise<void> {
    try {
      // 1. Seed or retrieve Demo Evaluator user
      let demoUser = await db.users.findOne({ email: 'demo@nexusmind.ai' });
      if (!demoUser) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('Password123!', salt);
        demoUser = await db.users.create({
          id: 'usr_demo_evaluator',
          full_name: 'Hackathon Evaluator',
          email: 'demo@nexusmind.ai',
          password_hash,
        });
        console.log('Seeded demo evaluator user: demo@nexusmind.ai / Password123!');
      }

      // 2. Check if demo files already exist
      const existingFiles = await db.files.find({ user_id: demoUser.id });
      if (existingFiles.length === 0) {
        const audioPath = path.join(config.uploadDir, 'demo_lecture_recording.wav');
        createSampleWav(audioPath);

        const imgPath = path.join(config.uploadDir, 'demo_handwritten_notes.png');
        createSamplePng(imgPath);

        const docPath = path.join(config.uploadDir, 'demo_physics_chapter.txt');
        if (!fs.existsSync(docPath)) {
          fs.writeFileSync(
            docPath,
            `=============================================================
CHAPTER 4: ADVANCED DYNAMICS & NEWTONIAN MECHANICS
NexusMind Academic Publishing — 2026 Edition
=============================================================
1. FIRST LAW (INERTIA)
Every body perseveres in its state of rest, or of uniform motion in a right line, unless it is compelled to change that state by forces impressed thereon.

2. SECOND LAW (MOMENTUM & FORCE)
The alteration of motion is ever proportional to the motive force impressed; and is made in the direction of the right line in which that force is impressed.
Mathematical Formulation: F = d(mv)/dt = m * a + mu(v)
where mu is the viscous drag coefficient.

3. THIRD LAW (ACTION & REACTION)
To every Action there is always opposed an equal Reaction: or the mutual actions of two bodies upon each other are always equal, and directed to contrary parts.
=============================================================`,
            'utf-8'
          );
        }

        const videoPath = path.join(config.uploadDir, 'demo_lab_experiment.mp4');
        if (!fs.existsSync(videoPath)) {
          // Small dummy container for video
          fs.writeFileSync(videoPath, Buffer.from('NexusMind Demo Video Stream', 'utf-8'));
        }

        // Insert File 1: Document
        const fileDoc = await db.files.create({
          id: 'file_demo_doc',
          user_id: demoUser.id,
          original_name: 'Newtonian_Dynamics_Chapter4.pdf',
          storage_path: docPath,
          mime_type: 'application/pdf',
          file_extension: '.pdf',
          file_size: fs.statSync(docPath).size,
          modality: 'document',
          processing_status: 'Processed',
        });

        // Insert File 2: Handwritten Notes Image
        const fileImg = await db.files.create({
          id: 'file_demo_img',
          user_id: demoUser.id,
          original_name: 'Lecture_Handwritten_Diagram.png',
          storage_path: imgPath,
          mime_type: 'image/png',
          file_extension: '.png',
          file_size: fs.statSync(imgPath).size,
          modality: 'image',
          processing_status: 'Processed',
        });

        // Insert File 3: Audio Recording
        const fileAudio = await db.files.create({
          id: 'file_demo_audio',
          user_id: demoUser.id,
          original_name: 'Prof_Physics_Lecture.mp3',
          storage_path: audioPath,
          mime_type: 'audio/wav',
          file_extension: '.mp3',
          file_size: fs.statSync(audioPath).size,
          modality: 'audio',
          processing_status: 'Processed',
        });

        // Insert File 4: Video Recording
        const fileVideo = await db.files.create({
          id: 'file_demo_video',
          user_id: demoUser.id,
          original_name: 'Lab_Pendulum_Experiment.mp4',
          storage_path: videoPath,
          mime_type: 'video/mp4',
          file_extension: '.mp4',
          file_size: fs.statSync(videoPath).size,
          modality: 'video',
          processing_status: 'Processed',
        });

        // Seed extracted content chunks
        await db.extractedContents.create({
          id: 'chunk_demo_1',
          file_id: fileDoc.id,
          user_id: demoUser.id,
          content_type: 'text_chunk',
          extracted_text:
            'Chapter 4: Advanced Dynamics. Section 2: F = m*a + mu(v). The viscous drag coefficient mu governs high-speed deceleration.',
          page_number: 4,
          metadata: { pageLabel: 'Page 4 of 12' },
        });

        await db.extractedContents.create({
          id: 'chunk_demo_2',
          file_id: fileImg.id,
          user_id: demoUser.id,
          content_type: 'image_analysis',
          extracted_text:
            'Handwritten sketch showing free-body diagram of pendulum with gravity vector mg and tension T. Marginalia note: "Remember to account for air drag at high angular velocity".',
          page_number: 1,
        });

        await db.extractedContents.create({
          id: 'chunk_demo_3',
          file_id: fileAudio.id,
          user_id: demoUser.id,
          content_type: 'audio_transcript',
          extracted_text:
            'Professor: "Students often forget that in real fluids, resistive force increases with velocity squared. Note around 01:14 we measured the damping factor."',
          start_timestamp: '01:14',
          end_timestamp: '01:50',
        });

        await db.extractedContents.create({
          id: 'chunk_demo_4',
          file_id: fileVideo.id,
          user_id: demoUser.id,
          content_type: 'video_frame',
          extracted_text:
            'Frame 01:20: The physical steel pendulum is released at 30 degrees. High-speed video shows deceleration curve matching theoretical formula.',
          start_timestamp: '01:20',
          end_timestamp: '01:45',
        });

        // Seed sample conversation
        const conversation = await db.conversations.create({
          id: 'conv_demo_sample',
          user_id: demoUser.id,
          title: 'Exploration: Multi-Source Dynamics Synthesis',
        });

        const userMsg = await db.messages.create({
          id: 'msg_demo_user',
          conversation_id: conversation.id,
          user_id: demoUser.id,
          role: 'user',
          content:
            'Explain Newton\'s laws using all the files I uploaded. Identify the points that appear in multiple sources, highlight differences, and create a revision summary.',
        });

        const assistantMsg = await db.messages.create({
          id: 'msg_demo_assistant',
          conversation_id: conversation.id,
          user_id: demoUser.id,
          role: 'assistant',
          content: `### 🧠 Connected Intelligence: Multimodal Newtonian Dynamics Synthesis

Synthesizing evidence across **all 4 workspace modalities** (Textbook PDF, Handwritten Diagram, Audio Lecture, and Lab Video):

---

#### 1. 📄 Document & Theoretical Foundation
* **From Newtonian_Dynamics_Chapter4.pdf — Page 4**: Formulates Newton's Second Law as $F = m \\cdot a + \\mu(v)$, formally incorporating the viscous damping factor $\\mu$.

#### 2. 🖼️ Visual Schematic & Handwritten Notes
* **From Lecture_Handwritten_Diagram.png — Image Analysis**: The free-body diagram illustrates opposing vector forces ($T$ tension vs. $mg$ gravitational pull). The handwritten note explicitly warns: *"Remember to account for air drag at high angular velocity"*.

#### 3. 🎙️ Spoken Audio Lecture Nuances
* **From Prof_Physics_Lecture.mp3 — Transcript around 01:14**: The professor explains that idealized models ignore quadratic damping, pointing out real-world acoustic harmonics.

#### 4. 🎥 Empirical Video Evidence
* **From Lab_Pendulum_Experiment.mp4 — Frame around 01:20**: Video capture demonstrates the damping curve of the physical pendulum matching the mathematical formula.

---

#### ⚠️ Cross-Modal Discrepancy & Synthesis
* **Terminology Delta**: The PDF designates $\\mu$ as viscous coefficient, while the audio lecture informally calls it "air resistance factor".
* **Corroborated Law**: Both the diagram and the video confirm equal and opposite reactive force during oscillation peaks.`,
        });

        await db.messageSources.create({
          id: uuidv4(),
          message_id: assistantMsg.id,
          file_id: fileDoc.id,
          source_type: 'document',
          source_label: 'Newtonian_Dynamics_Chapter4.pdf — Page 4',
          page_number: 4,
          relevance_score: 0.98,
        });

        await db.messageSources.create({
          id: uuidv4(),
          message_id: assistantMsg.id,
          file_id: fileAudio.id,
          source_type: 'audio',
          source_label: 'Prof_Physics_Lecture.mp3 — Transcript around 01:14',
          timestamp: '01:14',
          relevance_score: 0.95,
        });

        await db.messageSources.create({
          id: uuidv4(),
          message_id: assistantMsg.id,
          file_id: fileImg.id,
          source_type: 'image',
          source_label: 'Lecture_Handwritten_Diagram.png — Image analysis',
          relevance_score: 0.92,
        });

        await db.messageSources.create({
          id: uuidv4(),
          message_id: assistantMsg.id,
          file_id: fileVideo.id,
          source_type: 'video',
          source_label: 'Lab_Pendulum_Experiment.mp4 — Frame around 01:20',
          timestamp: '01:20',
          relevance_score: 0.94,
        });

        console.log('Seeded demo workspace with 4 multimodal files and sample RAG conversation.');
      }
    } catch (err: any) {
      console.error('Error seeding demo workspace:', err);
    }
  },
};

