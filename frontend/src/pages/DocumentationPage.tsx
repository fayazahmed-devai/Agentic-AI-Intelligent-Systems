import React from 'react';
import {
  BookOpen,
  Layers,
  Cpu,
  Server,
  Database,
  Lock,
  Upload,
  Video,
  FileText,
  Image as ImageIcon,
  Headphones,
  Network,
  CheckCircle2,
  Sparkles,
  Search,
  ShieldCheck,
} from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 text-slate-800">
      {/* Title */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-brand-violet text-xs font-mono font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>NexusMind AI • Product Documentation & Architecture Guide</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-navy-900 tracking-tight">
          System Overview & User Guide
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Learn how NexusMind AI ingests, connects, indexes, and queries information across Documents, Images, Audio, and Video in one unified cognitive workspace.
        </p>
      </div>

      {/* 1. How It Works */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy-900 flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs font-mono">
            1
          </span>
          <span>Core Workflow & Connected Intelligence</span>
        </h2>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed">
          <p>
            NexusMind AI bridges fragmented knowledge across diverse media types into a single interactive environment. Instead of handling each format in silos, the system establishes cross-modal semantic connections:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-navy-900 font-bold text-xs">
                <Upload className="w-4 h-4 text-brand-violet" />
                <span>1. Ingest</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload files, record microphone audio, or capture camera snapshots directly in the browser.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-navy-900 font-bold text-xs">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>2. Process</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Automatic text chunking, OCR on visual diagrams, and speech transcription with timestamping.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-navy-900 font-bold text-xs">
                <Network className="w-4 h-4 text-brand-teal" />
                <span>3. Connect</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Multi-vector indexing discovers semantic connections across text, visuals, audio, and video.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-navy-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>4. Query</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ask natural questions and receive verified answers with page citations and audio/video timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Supported Modalities */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy-900 flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-brand-violet text-white flex items-center justify-center text-xs font-mono">
            2
          </span>
          <span>Supported Modalities & Processing Pipelines</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Documents (PDF, DOCX, TXT)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts text hierarchies, sections, headings, mathematical formulas, and tabular data. Text is automatically segmented into contextual chunks with page numbers preserved for exact citation grounding.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Supported extensions: .pdf, .docx, .txt
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
              <ImageIcon className="w-4 h-4" />
              <span>Images & Visual Media (PNG, JPG, WEBP)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Processes handwritten lecture notes, engineering schematics, whiteboards, flowcharts, and diagrams. Deep multimodal models extract visual descriptions and optical text into structured records.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Supported extensions: .png, .jpg, .jpeg, .webp
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
              <Headphones className="w-4 h-4" />
              <span>Audio Recordings (MP3, WAV, M4A)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transcribes lectures, meetings, and voice recordings. Generates timestamped segment transcriptions that allow the AI assistant to cite the exact second in the audio stream where a fact was discussed.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Supported extensions: .mp3, .wav, .m4a
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center space-x-2 text-purple-600 font-bold text-sm">
              <Video className="w-4 h-4" />
              <span>Video Recordings (MP4, MOV, WEBM)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzes video demonstrations, laboratory experiments, and presentations. Synchronizes audio speech with visual scene context to answer questions across both visual events and spoken dialogue.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Supported extensions: .mp4, .mov, .webm
            </div>
          </div>
        </div>
      </section>

      {/* 3. System Architecture & Technical Specifications */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy-900 flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center text-xs font-mono">
            3
          </span>
          <span>Technical Architecture</span>
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Subsystem</th>
                <th className="p-3.5">Technology Stack</th>
                <th className="p-3.5">Architecture Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3.5 font-bold text-navy-900 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-violet" />
                  <span>Frontend</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono">React 18, Vite 5, TypeScript, Tailwind CSS</td>
                <td className="p-3.5 text-slate-500">Single Page Application with client-side routing, responsive layouts, and interactive analytics via Recharts.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-navy-900 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>Backend API</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono">Node.js, Express.js, TypeScript</td>
                <td className="p-3.5 text-slate-500">Modular REST architecture, Zod schema validation, Multer streaming uploads, and centralized error handling.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-navy-900 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Security & Auth</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono">JWT, HttpOnly Cookies, bcryptjs</td>
                <td className="p-3.5 text-slate-500">Stateless JWT session tokens stored in secure HttpOnly cookies. Passwords hashed using bcrypt with salt rounds.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-navy-900 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>Data Layer</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono">PostgreSQL / Supabase + Private Storage</td>
                <td className="p-3.5 text-slate-500">Relational schema with row ownership verification, full-text indexing, and secure file chunking storage.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-navy-900 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Engine</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono">Google Gemini Multimodal API</td>
                <td className="p-3.5 text-slate-500">Grounded retrieval-augmented generation (RAG) pipeline with zero client-side API key exposure.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Privacy, Security & Data Isolation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy-900 flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs font-mono">
            4
          </span>
          <span>Security & Data Privacy</span>
        </h2>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs md:text-sm text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="font-bold text-navy-900 text-xs">Strict Data Isolation</div>
              <p className="text-[11px] text-slate-500">
                Every file, chunk, and conversation is strictly scoped to the authenticated user ID at the database query level.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Lock className="w-4 h-4 text-brand-violet" />
              <div className="font-bold text-navy-900 text-xs">Credential Protection</div>
              <p className="text-[11px] text-slate-500">
                No passwords or API secrets are ever exposed in client bundles or network responses.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <div className="font-bold text-navy-900 text-xs">Grounded Citations</div>
              <p className="text-[11px] text-slate-500">
                Responses are strictly grounded in user-uploaded source materials with verifiable references to eliminate hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
