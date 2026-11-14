import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Network,
  Search,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    try {
      await login('demo@nexusmind.ai', 'Password123!');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfc] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-900/5 border border-navy-900/10 text-navy-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
            <span>Production-Ready Multimodal AI Knowledge Assistant</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-navy-900 tracking-tight leading-[1.15]">
            Don't just store information.{' '}
            <span className="bg-gradient-to-r from-navy-900 via-brand-violet to-brand-teal bg-clip-text text-transparent">
              Make it intelligent.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload PDFs, handwritten notes, audio recordings, and videos into a single workspace. NexusMind AI synthesizes fragmented data into grounded, verifiable answers with exact source citations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold shadow-md shadow-navy-900/10 transition flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold shadow-md shadow-navy-900/10 transition flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLaunchDemo}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-navy-900 border border-slate-300 text-sm font-bold shadow-sm transition flex items-center space-x-2 group"
                >
                  <Zap className="w-4 h-4 text-brand-violet group-hover:scale-110 transition" />
                  <span>Explore Demo (1-Click)</span>
                </button>
              </>
            )}
            <Link
              to="/docs"
              className="px-5 py-3 rounded-xl text-slate-600 hover:text-navy-900 text-sm font-semibold transition"
            >
              Documentation
            </Link>
          </div>
        </div>

        {/* 4-Modality Ingestion Preview Visual Card */}
        <div className="mt-14 max-w-4xl mx-auto p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-brand-violet" />
              <span className="text-sm font-bold text-navy-900">
                Connected Intelligence in Action
              </span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              4 Modalities Connected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-xs font-bold text-slate-800 truncate">Textbook Chapter</div>
              <p className="text-[11px] text-slate-500">PDF page extraction, headings & formula derivations</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <div className="text-xs font-bold text-slate-800 truncate">Handwritten Diagram</div>
              <p className="text-[11px] text-slate-500">Gemini vision object recognition & handwritten notes</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2">
              <Music className="w-5 h-5 text-amber-600" />
              <div className="text-xs font-bold text-slate-800 truncate">Lecture Audio</div>
              <p className="text-[11px] text-slate-500">Timestamped acoustic transcripts & key topics</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
              <Film className="w-5 h-5 text-purple-600" />
              <div className="text-xs font-bold text-slate-800 truncate">Lab Experiment Video</div>
              <p className="text-[11px] text-slate-500">Keyframe analysis & visual event timestamps</p>
            </div>
          </div>

          {/* AI Synthesis Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
            <div className="font-bold text-navy-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand-violet" />
              <span>Grounded Cross-Modal Output:</span>
            </div>
            <p>
              "The formula derived on <strong className="text-navy-900">Page 4 of the PDF</strong> aligns with the vector sketch in your <strong className="text-navy-900">handwritten diagram</strong>. The damping delay noted in the <strong className="text-navy-900">audio lecture at 01:14</strong> is verified by the physical pendulum deceleration captured at <strong className="text-navy-900">video frame 01:20</strong>."
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900">
              Built for Modern Multimodal Research
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Engineered with production-grade security, row ownership, and genuine multimodal intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">100% Grounded RAG</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No hallucinations or fake references. Answers are grounded in retrieved workspace chunks with exact page numbers and timestamps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-violet text-white flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Connected Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects what is read, seen, and heard. Discovers common concepts, detects cross-modal contradictions, and synthesizes unified conclusions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Enterprise Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                JWT in HttpOnly cookies, bcrypt hashing, Zod validation, private Supabase Storage buckets, and strict row-level user ownership isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 px-4 md:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-navy-900">NexusMind AI</span>
            <span>•</span>
            <span>Don't just store information. Make it intelligent.</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/docs" className="hover:text-navy-900">Documentation</Link>
            <Link to="/login" className="hover:text-navy-900">Sign In</Link>
            <Link to="/register" className="hover:text-navy-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

