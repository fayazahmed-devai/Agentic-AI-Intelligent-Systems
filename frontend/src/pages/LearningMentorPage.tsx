import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Loader2,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import { ExplanationDepth, LearningProgress } from '../types';
import FormattedContent from '../components/FormattedContent';

const DEPTH_LEVELS: { id: ExplanationDepth; title: string; subtitle: string; icon: string }[] = [
  { id: 'beginner', title: 'Beginner (ELI5)', subtitle: 'Simple everyday analogies with zero jargon', icon: '🌱' },
  { id: 'simple', title: 'Simple & Clear', subtitle: 'Step-by-step foundational concepts', icon: '📘' },
  { id: 'university', title: 'University Level', subtitle: 'Academic rigor, theoretical proofs & derivations', icon: '🏛️' },
  { id: 'technical', title: 'Engineering & Technical', subtitle: 'Formulas, circuit models & implementation details', icon: '⚙️' },
  { id: 'exam', title: 'Exam-Oriented High Yield', subtitle: 'Scoring tips, expected questions & trap answers', icon: '🎯' },
];

export default function LearningMentorPage() {
  const navigate = useNavigate();
  const { files } = useFiles();
  const [topic, setTopic] = useState('');
  const [selectedDepth, setSelectedDepth] = useState<ExplanationDepth>('university');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<LearningProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const res = await api.get('/mentor/progress');
      if (res.data) setProgressData(res.data);
    } catch (err) {
      console.error('Failed to load learning progress', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleExplain = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setLoading(true);
    setExplanation(null);
    try {
      const res: any = await api.post('/mentor/explain', {
        topic: t,
        depth: selectedDepth,
      });
      setExplanation(res?.data?.explanation || res?.explanation || '');
      fetchProgress();
    } catch (err: any) {
      setExplanation(`Unable to synthesize explanation: ${err.message || 'Error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-brand-violet text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            Adaptive Cognitive Mentor
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Personal AI Learning Mentor
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Calibrate topic explanations to 5 distinct comprehension depths, monitor mastery milestones, and generate targeted study sheets grounded in your course materials.
          </p>
        </div>

        {/* Quick Quiz Shortcut */}
        <button
          onClick={() => navigate('/quiz')}
          className="px-4 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition flex items-center gap-2 shadow-sm"
        >
          <Award className="w-4 h-4 text-brand-violet" />
          <span>Launch Quiz Studio</span>
        </button>
      </div>

      {/* Depth Selector & Inquiry Input */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Select Explanation Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DEPTH_LEVELS.map((lvl) => {
              const isSelected = selectedDepth === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedDepth(lvl.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-violet bg-violet-50/50 ring-2 ring-brand-violet/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="text-lg mb-1 block">{lvl.icon}</span>
                    <div className="text-xs font-bold text-navy-900">{lvl.title}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lvl.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            2. Topic or Question to Master
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleExplain()}
              placeholder="e.g. Superposition Theorem, Thevenin's Equivalent, or PN junction barrier potential..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-slate-800 font-medium"
            />
            <button
              onClick={() => handleExplain()}
              disabled={loading || !topic.trim()}
              className="px-6 py-3 bg-gradient-to-r from-navy-900 to-brand-violet text-white text-sm font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calibrating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400">Quick Topics:</span>
          {['Superposition Theorem', 'Thevenin Theorem', 'Maximum Power Transfer', 'Kirchhoff Laws'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setTopic(s);
                handleExplain(s);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Output Container */}
      {explanation && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {DEPTH_LEVELS.find((d) => d.id === selectedDepth)?.icon}
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  {topic} — {DEPTH_LEVELS.find((d) => d.id === selectedDepth)?.title}
                </h2>
                <span className="text-xs text-slate-400">
                  Grounded across {files.length} library sources
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/quiz?topic=${encodeURIComponent(topic)}`)
                }
                className="px-3 py-1.5 rounded-xl border border-brand-violet bg-violet-50 text-brand-violet text-xs font-semibold hover:bg-violet-100 transition flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Test Yourself on This</span>
              </button>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm pt-2">
            <FormattedContent content={explanation} />
          </div>
        </div>
      )}

      {/* Learning Mastery Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-violet" />
            Your Topic Mastery & Learning Progress
          </h2>
        </div>

        {loadingProgress ? (
          <div className="p-8 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-violet" />
            <span className="text-xs font-semibold">Calculating mastery stats...</span>
          </div>
        ) : progressData.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No Learning History Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ask your AI Learning Mentor for explanations or attempt interactive quizzes to automatically populate your mastery radar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-navy-900 truncate">{item.topic}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.mastery_score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.mastery_score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.mastery_score}% Mastery
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-violet to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.mastery_score}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Quizzes: {item.quizzes_passed}/{item.quizzes_attempted} passed</span>
                  <span>{new Date(item.last_studied_at).toLocaleDateString()}</span>
                </div>

                {item.recommended_next_step && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-brand-violet tracking-wide block">
                      Next Recommended Step:
                    </span>
                    <p className="line-clamp-2">{item.recommended_next_step}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

