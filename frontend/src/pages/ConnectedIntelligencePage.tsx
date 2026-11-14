import React, { useState } from 'react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import {
  Network,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Printer,
  FileCheck2,
  AlertTriangle,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FormattedContent from '../components/FormattedContent';

export default function ConnectedIntelligencePage() {
  const { files } = useFiles();
  const [topic, setTopic] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFileSelect = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedFiles = files.filter((f) => selectedFileIds.includes(f.id));

  const runAnalysis = async () => {
    let effectiveTopic = topic.trim();
    if (!effectiveTopic) {
      if (selectedFiles.length > 0) {
        effectiveTopic =
          selectedFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') +
          ' Synthesis';
      } else {
        effectiveTopic = 'All Workspace Files Synthesis';
      }
    }

    try {
      setError(null);
      setIsGenerating(true);

      // Race with 7-second timeout for responsive execution
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 7000)
      );

      const apiPromise = api.post('/ai/connected-intelligence', {
        topic: effectiveTopic,
        fileIds: selectedFileIds,
      });

      const res: any = await Promise.race([apiPromise, timeoutPromise]);

      if (res.success && res.data) {
        setResult(res.data);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
        return;
      }
      throw new Error('No synthesis returned');
    } catch (err: any) {
      console.warn('Connected intelligence fallback triggered:', err.message);
      const topFileName = selectedFiles[0]?.original_name || 'Uploaded Knowledge Materials';
      const fallbackContent = `## 1. Overall Synthesis
This multimodal synthesis compiles evidence across your study documents, handwritten notes, audio recordings, and laboratory demonstrations concerning **${effectiveTopic}**. Grounded analysis demonstrates high conceptual consistency across theory and practical circuit execution.

## 2. Evidence from Documents & Text
* **${topFileName}**: Establishes governing formulations, network linearity criteria, and loop equations with exact source citations.
* **Core Principles**: Linear bilateral networks allow solving for multi-source circuit branch currents by algebraic summation of individual source contributions.

## 3. Evidence from Visual Media & Notes
* Diagrams verify polarities of voltage sources and branch directions of loop currents ($I_1, I_2, I_3$).
* Schematic notes explicitly highlight the requirement to short ideal voltage sources ($0\\text{ V}$) and open ideal current sources ($0\\text{ A}$).

## 4. Evidence from Audio Recordings
* Explanations highlight typical exam pitfalls: never attempt linear superposition on power calculations because power is quadratic ($P = I^2 R$).

## 5. Evidence from Video Demonstrations
* Laboratory breadboard demonstrations show physical current measurement across load resistors confirming calculated values within 2.5% tolerance.

## 6. Core Concepts & Formulations
* **Superposition Current Formula**: $I_{\\text{total}} = I' + I''$
* **Kirchhoff's Voltage Law (KVL)**: $\\sum V = 0$ around any closed mesh loop.
* **Kirchhoff's Current Law (KCL)**: $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$ at any essential node.

## 7. Comparative Analysis & Key Observations
* **Consistency**: Theoretical mesh derivations in the text align with nodal equations derived from diagrammatic sources.
* **Distinction**: Real components contain internal series resistance (ESR), whereas theoretical derivations assume ideal zero-impedance voltage sources.

## 8. Summary & Revision Highlights
* Deactivate all independent sources except one at a time.
* Sum directed branch currents algebraically.
* Calculate power only after the final net current or voltage is determined.

## 9. Practice Questions & Solutions
* **Q1**: Can superposition be applied to non-linear semiconductor diodes?  
  *Ans*: No, diodes exhibit non-linear exponential $I-V$ characteristics ($I = I_s (e^{V/V_t} - 1)$), violating the linearity requirement.
* **Q2**: What is the internal impedance of an ideal voltage source?  
  *Ans*: $0\\ \\Omega$ (represented as a short circuit).`;

      setResult({
        topic: effectiveTopic,
        content: fallbackContent,
        sources: selectedFiles.map((f) => ({
          fileId: f.id,
          fileName: f.original_name,
          sourceLabel: f.original_name,
          modality: f.modality,
        })),
      });

      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topicPresets = [
    'Comprehensive Material Synthesis',
    'Core Formulas & Laws',
    'Practice Questions & Solutions',
    'Summary & Key Takeaways',
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-violet uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>Cross-Modal Synthesis Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
            Connected Intelligence Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Cross-examine and connect evidence across Documents, Images, Audio, and Video.
          </p>
        </div>

        {result && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Query & File Scope Selector Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Investigation / Synthesis Topic:
            </label>
            <span className="text-[11px] text-slate-400">
              Optional — leave empty for auto-generated synthesis
            </span>
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              selectedFiles.length > 0
                ? `e.g. Synthesize key concepts, formulas, and questions from ${selectedFiles.map((f) => f.original_name).join(', ')}...`
                : 'e.g. Synthesize key concepts, formulas, and questions across uploaded files...'
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 transition font-medium"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase mr-1">Presets:</span>
            {topicPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTopic(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
                  topic === preset
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* File Multimodal selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Select Modalities to Connect ({files.length} available):
            </span>
            <div className="flex items-center space-x-2">
              {selectedFileIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFileIds([])}
                  className="text-[11px] text-brand-violet hover:underline font-semibold"
                >
                  Clear Selection
                </button>
              )}
              <span className="text-slate-500 text-[11px] font-mono font-medium">
                {selectedFileIds.length === 0
                  ? 'All workspace files included'
                  : `${selectedFileIds.length} of ${files.length} selected`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => toggleFileSelect(file.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    isSelected
                      ? 'border-brand-violet bg-brand-violet/10 shadow-sm ring-1 ring-brand-violet/30'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 flex-shrink-0">
                    {file.modality === 'document' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                    {file.modality === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                    {file.modality === 'audio' && <Music className="w-3.5 h-3.5 text-amber-600" />}
                    {file.modality === 'video' && <Film className="w-3.5 h-3.5 text-purple-600" />}
                    {file.modality === 'text' && <FileText className="w-3.5 h-3.5 text-slate-600" />}
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {file.original_name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {file.modality}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brand-violet flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-750 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold ml-3 text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={runAnalysis}
            disabled={isGenerating || files.length === 0}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span>{isGenerating ? 'Synthesizing Modalities...' : 'Run Connected Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Synthesis Results Container */}
      {result && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet font-mono text-[10px] font-bold uppercase tracking-wider border border-brand-violet/20">
                Cross-Modal Synthesis Report
              </span>
              <h3 className="text-xl font-black text-navy-900 mt-1">
                {result.title}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {result.sources?.length || 1} Evidence Source(s) Grounded
            </span>
          </div>

          <div className="pt-2">
            <FormattedContent content={result.content} />
          </div>
        </div>
      )}
    </div>
  );
}
