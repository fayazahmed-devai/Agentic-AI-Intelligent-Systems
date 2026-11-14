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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConnectedIntelligencePage() {
  const { files } = useFiles();
  const [topic, setTopic] = useState('Newtonian Dynamics & Experimental Verification');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const toggleFileSelect = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const runAnalysis = async () => {
    try {
      setIsGenerating(true);
      const res: any = await api.post('/ai/connected-intelligence', {
        topic: topic.trim(),
        fileIds: selectedFileIds,
      });

      if (res.success && res.data) {
        setResult(res.data);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      alert(err.message || 'Analysis failed');
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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-violet uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>Hackathon Highlight Feature</span>
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
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            Investigation / Synthesis Topic:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Explain Newton's laws using all uploaded sources..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 transition font-medium"
          />
        </div>

        {/* File Multimodal selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Select Modalities to Connect ({files.length} available):
            </span>
            <span className="text-slate-400 text-[11px]">
              {selectedFileIds.length === 0 ? 'All workspace files included' : `${selectedFileIds.length} selected`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => toggleFileSelect(file.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    isSelected
                      ? 'border-brand-violet bg-brand-violet/5 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 flex-shrink-0">
                    {file.modality === 'document' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                    {file.modality === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                    {file.modality === 'audio' && <Music className="w-3.5 h-3.5 text-amber-600" />}
                    {file.modality === 'video' && <Film className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {file.original_name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {file.modality}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet font-mono text-[10px] font-bold uppercase tracking-wider border border-brand-violet/20">
                Cross-Modal Synthesis Report
              </span>
              <h3 className="text-xl font-black text-navy-900 mt-1">
                {result.title}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {result.sources?.length || 4} Evidence Sources Grounded
            </span>
          </div>

          <div className="prose max-w-none text-xs md:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap space-y-4">
            {result.content}
          </div>
        </div>
      )}
    </div>
  );
}
