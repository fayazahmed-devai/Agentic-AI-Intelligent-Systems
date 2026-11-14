import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import {
  Layers,
  Sparkles,
  Upload,
  FolderOpen,
  MessageSquareText,
  Network,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  SearchCheck,
  Mic,
  GraduationCap,
  ShieldCheck,
  Bot,
  Search,
  Compass,
} from 'lucide-react';
import FileUploaderModal from '../components/FileUploaderModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, stats, activities, deleteFile } = useFiles();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState('');
  const navigate = useNavigate();

  const totalFiles = stats?.totalFiles || files.length;
  const processedFiles =
    stats?.processedFiles ||
    files.filter((f) => f.processing_status === 'Processed').length;
  const storageUsedMB = (
    (stats?.storageUsedBytes ||
      files.reduce((acc, f) => acc + (f.file_size || 0), 0)) /
    (1024 * 1024)
  ).toFixed(2);
  const questionsAsked = stats?.questionsAsked || 0;

  const handleQuickInquiry = (mode: 'chat' | 'detective' = 'chat') => {
    const q = quickQuestion.trim();
    if (!q) return;
    if (mode === 'detective') {
      navigate(`/detective?query=${encodeURIComponent(q)}`);
    } else {
      navigate(`/chat?query=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
            Welcome back, {user?.full_name || 'Investigator'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Don't just store information. Make it intelligent.
          </p>
        </div>

        <button
          onClick={() => setUploaderOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Quick AI Intelligence Inquiry Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-950 to-brand-violet text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Instant Cross-Modal Intelligence Inquiry
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
            Grounds across {files.length} library assets
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickInquiry('chat')}
              placeholder="Ask anything across your lecture notes, PDFs, handwriting, and recordings..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickInquiry('chat')}
              className="px-4 py-2.5 rounded-xl bg-white text-navy-900 text-xs font-bold hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
            <button
              onClick={() => handleQuickInquiry('detective')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <SearchCheck className="w-3.5 h-3.5 text-brand-teal" />
              <span>Investigate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Intelligence Suite (Part 2 Feature Hub) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
            Advanced Intelligence Features (Part 2 Suite)
          </h2>
          <span className="text-[11px] text-brand-violet font-semibold">100% Real Multimodal AI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/detective"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-brand-violet flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <SearchCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                AI Knowledge Detective
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Cross-modal forensic investigation and contradiction auditing across documents, OCR, audio & video.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Open Detective</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/graph"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                Interactive Knowledge Graph
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Visual topological map of entities, formulas, and concepts with click-to-explain node drawers.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Explore Graph</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/voice"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                Voice Assistant
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Hands-free oral Q&A with live speech recognition, pulsing visualizer orb, and spoken library replies.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Speak to AI</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/mentor"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                Personal Learning Mentor
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                5 comprehension depths (Beginner, Simple, University, Technical, Exam) with mastery radar tracking.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Consult Mentor</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/evidence"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                Evidence & Trust Centre
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Claim verification matrix (Supported, Partial, Conflicting) with 100% grounding & zero hallucination.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Verify Claims</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/research-agent"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                Autonomous Research Agent
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Dispatches a 5-stage autonomous researcher to compile peer-grade research dossiers and spot gaps.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Dispatch Agent</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/quiz"
            className="p-4 rounded-2xl bg-white hover:border-brand-violet/50 border border-slate-200 shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-violet transition">
                AI Quiz Arena & Flashcards
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Playable interactive quizzes and 3D flip study flashcards auto-generated from your documents.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-brand-violet flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Play Quiz</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/connected-intelligence"
            className="p-4 rounded-2xl bg-gradient-to-br from-navy-900 to-brand-violet text-white shadow-sm transition group space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white">
                Connected Intelligence
              </h3>
              <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                Unified cross-modal synthesis fusing documents, diagrams, audio lectures, and lab video.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-white/90 flex items-center gap-1 pt-2 border-t border-white/20">
              <span>Run Synthesis</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Uploads
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{totalFiles}</div>
          <span className="text-[11px] text-slate-500">Across all 5 modalities</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Processed Files
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{processedFiles}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalFiles > 0 ? `${((processedFiles / totalFiles) * 100).toFixed(0)}% ready for RAG` : 'Ready'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Storage Used
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">
            {storageUsedMB} <span className="text-sm font-sans font-bold text-slate-400">MB</span>
          </div>
          <span className="text-[11px] text-slate-500">Private storage allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Questions Asked
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <MessageSquareText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{questionsAsked}</div>
          <span className="text-[11px] text-amber-600 font-semibold">Grounded AI inquiries</span>
        </div>
      </div>

      {/* Two-Column: Recent Files + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Files Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-brand-violet" />
              <span>Recent Workspace Files</span>
            </h3>
            <Link to="/library" className="text-xs text-brand-violet font-semibold hover:underline">
              View all ({files.length})
            </Link>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p>No files uploaded yet. Click Upload Files to begin.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {files.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="py-3 flex items-center justify-between space-x-3 text-xs"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                      {file.modality === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
                      {file.modality === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                      {file.modality === 'audio' && <Music className="w-4 h-4 text-amber-600" />}
                      {file.modality === 'video' && <Film className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="truncate">
                      <h5 className="font-semibold text-slate-800 truncate">
                        {file.original_name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(file.file_size / 1024).toFixed(1)} KB • {file.modality.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        file.processing_status === 'Processed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : file.processing_status === 'Processing'
                          ? 'bg-amber-50 text-amber-700 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {file.processing_status}
                    </span>

                    <a
                      href={`/api/files/${file.id}/stream`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-navy-900"
                      title="Open File Stream"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            <span>Recent Activity</span>
          </h3>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recent activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-violet mt-1.5 flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FileUploaderModal isOpen={uploaderOpen} onClose={() => setUploaderOpen(false)} />
    </div>
  );
}
