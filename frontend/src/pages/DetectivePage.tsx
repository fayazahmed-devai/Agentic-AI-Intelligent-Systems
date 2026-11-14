import React, { useState, useEffect } from 'react';
import {
  SearchCheck,
  FileText,
  Image as ImageIcon,
  Headphones,
  Video,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  FolderOpen,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import { Investigation, InvestigationFinding } from '../types';
import FormattedContent from '../components/FormattedContent';

const SAMPLE_QUERIES = [
  'Compare the concepts in my uploaded notes with the lecture audio and diagrams.',
  'Investigate any contradictions or discrepancies between the theory PDF and lab experiment values.',
  'Find all formulas and derivations mentioned across document, image, and audio sources.',
  'Provide a forensic synthesis of the entire uploaded topic with verified source citations.',
];

export default function DetectivePage() {
  const { files } = useFiles();
  const [query, setQuery] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/detective/history');
      if (res.data) setHistory(res.data);
    } catch (err) {
      console.error('Failed to load investigation history', err);
    }
  };

  const handleToggleFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiles = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  const runInvestigation = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setInvestigation(null);
    setActiveStep(1);

    // Simulate realistic stepped progress while awaiting live backend Gemini investigation
    const stepTimer1 = setTimeout(() => setActiveStep(2), 1200);
    const stepTimer2 = setTimeout(() => setActiveStep(3), 2500);
    const stepTimer3 = setTimeout(() => setActiveStep(4), 4000);

    try {
      const res = await api.post('/detective/investigate', {
        query: q,
        fileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setActiveStep(5);
      setInvestigation(res.data);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Investigation failed. Please check your files and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case 'document':
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-amber-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-bold uppercase tracking-wider mb-2">
            <SearchCheck className="w-4 h-4 text-brand-violet" />
            AI Knowledge Detective
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Cross-Modal Forensic Knowledge Investigation
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit, correlate, and cross-examine evidence across documents, handwriting, diagrams, audio recordings, and videos to uncover deep relationships and detect contradictions.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Investigation Query or Hypothesis
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && runInvestigation()}
            placeholder="e.g. Compare the concepts in my uploaded notes with lecture audio and diagrams..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-slate-800 font-medium"
          />
          <button
            onClick={() => runInvestigation()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-navy-900 to-brand-violet text-white text-sm font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <SearchCheck className="w-4 h-4" />
                <span>Investigate</span>
              </>
            )}
          </button>
        </div>

        {/* Sample queries */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-slate-400">Sample Investigations:</span>
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sample);
                runInvestigation(sample);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition truncate max-w-[280px]"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* File selector filter */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Target Sources ({selectedFileIds.length === 0 ? 'All Files' : `${selectedFileIds.length} Selected`})
            </span>
            <button
              onClick={handleSelectAllFiles}
              className="text-xs font-semibold text-brand-violet hover:underline"
            >
              {selectedFileIds.length === files.length ? 'Deselect All' : 'Select All Sources'}
            </button>
          </div>
          {files.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">
              No files uploaded yet. Please upload documents, images, audio, or video to run cross-modal investigations.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <button
                    key={file.id}
                    onClick={() => handleToggleFile(file.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                      isSelected
                        ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {getModalityIcon(file.modality)}
                    <span className="max-w-[150px] truncate">{file.original_name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Investigation Progress Stepper */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-brand-violet animate-spin" />
            <h3 className="text-sm font-bold text-navy-900">
              Multimodal Detective Pipeline Executing...
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {[
              { step: 1, title: 'Document & OCR Scan', desc: 'Examining text chunks and handwritten notes' },
              { step: 2, title: 'Audio & Video Mining', desc: 'Parsing speech transcripts and scene frames' },
              { step: 3, title: 'Cross-Modal Correlation', desc: 'Aligning concepts across distinct modalities' },
              { step: 4, title: 'Forensic Synthesis', desc: 'Verifying citations & detecting discrepancies' },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-3 rounded-xl border transition ${
                  activeStep >= s.step
                    ? 'border-brand-violet bg-brand-violet/5'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {activeStep > s.step ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : activeStep === s.step ? (
                    <Loader2 className="w-4 h-4 text-brand-violet animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 text-[10px] flex items-center justify-center text-slate-400">
                      {s.step}
                    </div>
                  )}
                  <span className="text-xs font-bold text-navy-900">{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Investigation Report */}
      {investigation && (
        <div className="space-y-6">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Modalities Interrogated
              </span>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {investigation.modalities_searched.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold uppercase"
                  >
                    {getModalityIcon(m)}
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Concepts Isolated
              </span>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {investigation.concepts_detected.slice(0, 5).map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-violet-50 text-brand-violet text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Discrepancies / Contradictions
              </span>
              <div className="mt-2 flex items-center gap-2">
                {investigation.contradictions_or_discrepancies &&
                investigation.contradictions_or_discrepancies.length > 0 ? (
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>{investigation.contradictions_or_discrepancies.length} Discrepancy Found</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cross-Modal Harmony (0 Conflicts)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discrepancy Alert Box if any */}
          {investigation.contradictions_or_discrepancies &&
            investigation.contradictions_or_discrepancies.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Forensic Discrepancy Advisory
                </div>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                  {investigation.contradictions_or_discrepancies.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Forensic Evidence Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-violet" />
                Cross-Modal Correlated Evidence ({investigation.findings.length} Source Points)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investigation.findings.map((f: InvestigationFinding, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-violet/40 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModalityIcon(f.modality)}
                      <span className="text-xs font-bold text-navy-900 truncate max-w-[180px]">
                        {f.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {f.sourceLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {f.finding}
                  </p>
                  {f.timestampOrPage && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Ref: {f.timestampOrPage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Forensic Synthesis */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-violet" />
              <h2 className="text-base font-bold text-navy-900">
                Final Investigation Report & Synthesis
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm border-t border-slate-100 pt-4">
              <FormattedContent content={investigation.final_synthesis} />
            </div>
          </div>
        </div>
      )}

      {/* Investigation History Drawer / List */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-slate-400" />
              Recent Investigations
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setInvestigation(item)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer px-2 rounded-lg transition"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">{item.query}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()} • {item.findings?.length || 0} evidence findings
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
