import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ListOrdered,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import { ResearchTask, ResearchPlanStep } from '../types';
import FormattedContent from '../components/FormattedContent';

const SAMPLE_OBJECTIVES = [
  'Formulate a comprehensive research dossier on DC circuit theorems, super-position proofs, and power calculations.',
  'Investigate the historical derivation of Ohm and Kirchhoff laws and their modern solid-state equivalents.',
  'Synthesize all uploaded materials into an executive academic literature review for upcoming university examinations.',
];

export default function ResearchAgentPage() {
  const { files } = useFiles();
  const [objective, setObjective] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTask, setActiveTask] = useState<ResearchTask | null>(null);
  const [taskHistory, setTaskHistory] = useState<ResearchTask[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/research-agent/tasks');
      if (res.data) setTaskHistory(res.data);
    } catch (err) {
      console.error('Failed to load research tasks', err);
    }
  };

  const handleToggleFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const startResearchMission = async (objText?: string) => {
    const obj = (objText || objective).trim();
    if (!obj) return;

    setRunning(true);
    setActiveTask(null);
    setCurrentStepIndex(1);

    // Dynamic progression states while backend Gemini synthesizes the autonomous dossier
    const t1 = setTimeout(() => setCurrentStepIndex(2), 1500);
    const t2 = setTimeout(() => setCurrentStepIndex(3), 3000);
    const t3 = setTimeout(() => setCurrentStepIndex(4), 5000);

    try {
      const res = await api.post('/research-agent/start', {
        objective: obj,
        fileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setCurrentStepIndex(5);
      setActiveTask(res.data);
      fetchHistory();
    } catch (err: any) {
      console.error('Research mission failed', err);
    } finally {
      setRunning(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!activeTask?.dossier_markdown) return;
    const blob = new Blob([activeTask.dossier_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_Dossier_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4 text-brand-violet" />
            Autonomous Agent Architecture
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Autonomous AI Research Agent
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Dispatch an autonomous multi-stage research agent to decompose hypotheses, inspect cross-modal literature, synthesize structured evidence, and publish a peer-grade research dossier.
          </p>
        </div>
      </div>

      {/* Research Objective Input */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Define Research Mission Objective
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !running && startResearchMission()}
            placeholder="e.g. Formulate a comprehensive research dossier on DC circuit theorems and power proofs..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-slate-800 font-medium"
          />
          <button
            onClick={() => startResearchMission()}
            disabled={running || !objective.trim()}
            className="px-6 py-3 bg-gradient-to-r from-navy-900 to-brand-violet text-white text-sm font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agent Dispatched...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Dispatch Agent</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Objectives */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-slate-400">Sample Objectives:</span>
          {SAMPLE_OBJECTIVES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setObjective(sample);
                startResearchMission(sample);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition truncate max-w-[320px]"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Target Source Filter */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
            Target Grounding Sources ({selectedFileIds.length === 0 ? 'All Library Files' : `${selectedFileIds.length} Selected`})
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <button
                  key={file.id}
                  onClick={() => handleToggleFile(file.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isSelected
                      ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {file.original_name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Autonomous Multi-Step Execution Runner */}
      {running && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-brand-violet animate-spin" />
            <h3 className="text-sm font-bold text-navy-900">
              Autonomous Agent Executing Multi-Stage Mission...
            </h3>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { step: 1, title: 'Step 1: Hypothesis Decomposition', desc: 'Formulating investigative queries and mapping sub-problems' },
              { step: 2, title: 'Step 2: Multimodal Literature Scan', desc: 'Filtering documents, diagrams, OCR extractions, and speech' },
              { step: 3, title: 'Step 3: Forensic Cross-Modal Correlation', desc: 'Extracting formulas, data points, and factual citations' },
              { step: 4, title: 'Step 4: Knowledge Gap Analysis', desc: 'Detecting unanswered edge cases and conflicting measurements' },
              { step: 5, title: 'Step 5: Dossier Compilation & Formatting', desc: 'Generating structured markdown research report' },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                  currentStepIndex > s.step
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : currentStepIndex === s.step
                    ? 'border-brand-violet bg-violet-50/40 text-navy-900 ring-2 ring-brand-violet/20'
                    : 'border-slate-200 bg-slate-50/40 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {currentStepIndex > s.step ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : currentStepIndex === s.step ? (
                    <Loader2 className="w-5 h-5 text-brand-violet animate-spin flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold">{s.title}</div>
                    <div className="text-[11px] opacity-80">{s.desc}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white/60">
                  {currentStepIndex > s.step
                    ? 'Done'
                    : currentStepIndex === s.step
                    ? 'Active'
                    : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compiled Research Dossier */}
      {activeTask && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Autonomous Mission Complete
              </div>
              <h2 className="text-xl font-extrabold text-navy-900">{activeTask.objective}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synthesized from {activeTask.sources_analyzed?.length || files.length} cross-modal sources
              </p>
            </div>
            <button
              onClick={handleDownloadDossier}
              className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Markdown Dossier</span>
            </button>
          </div>

          {/* Key Findings & Knowledge Gaps Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-2">
              <span className="text-xs font-bold uppercase text-brand-violet tracking-wide block">
                Key Findings Isolated
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {activeTask.key_findings?.map((kf, i) => (
                  <li key={i}>{kf}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-800 tracking-wide block">
                Identified Knowledge Gaps
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {activeTask.identified_gaps?.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dossier Content */}
          <div className="prose prose-slate max-w-none text-sm pt-4 border-t border-slate-100">
            <FormattedContent content={activeTask.dossier_markdown} />
          </div>
        </div>
      )}

      {/* Task History */}
      {taskHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            Previous Autonomous Missions
          </div>
          <div className="divide-y divide-slate-100">
            {taskHistory.map((task) => (
              <div
                key={task.id}
                onClick={() => setActiveTask(task)}
                className="py-3.5 px-3 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">{task.objective}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(task.created_at).toLocaleDateString()} • {task.sources_analyzed?.length || 0} sources interrogated
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

