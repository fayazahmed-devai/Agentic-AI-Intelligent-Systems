import React, { useState } from 'react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckSquare,
  GitCompare,
  Copy,
  Check,
  Printer,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function ContentStudioPage() {
  const { files } = useFiles();
  const [selectedType, setSelectedType] = useState<
    'summary' | 'study_notes' | 'questions' | 'action_items' | 'comparison'
  >('questions');
  const [topic, setTopic] = useState('Newtonian Dynamics & Mechanical Laws');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const studioModes = [
    {
      id: 'questions',
      icon: HelpCircle,
      title: 'Practice Questions',
      desc: 'Multiple choice & short answers with explanations',
    },
    {
      id: 'study_notes',
      icon: BookOpen,
      title: 'Study & Revision Notes',
      desc: 'Topic-wise breakdown and simple explanations',
    },
    {
      id: 'summary',
      icon: Sparkles,
      title: 'Smart Summary',
      desc: 'Short, detailed summaries & key definitions',
    },
    {
      id: 'action_items',
      icon: CheckSquare,
      title: 'Action Items',
      desc: 'Prioritized checklist & operational tasks',
    },
    {
      id: 'comparison',
      icon: GitCompare,
      title: 'Compare Sources',
      desc: 'Cross-file similarities, differences & gaps',
    },
  ];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res: any = await api.post('/ai/generate-content', {
        type: selectedType,
        topic: topic.trim(),
        fileIds: files.map((f) => f.id),
      });

      if (res.success && res.data) {
        setGeneratedText(res.data.content);
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-brand-violet" />
            <span>Smart Content Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transform raw multimodal source materials into structured study notes, quizzes, summaries & checklists.
          </p>
        </div>

        {generatedText && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {studioModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedType(mode.id as any)}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-teal' : 'text-slate-500'}`} />
              <div>
                <h4 className="text-xs font-bold leading-tight">{mode.title}</h4>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-2 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {mode.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Prompt Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Target Focus / Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Chapter 4 Key Laws & Practice Problems..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-navy-900 transition font-medium"
          />
        </div>

        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-slate-500">
            Grounding across {files.length} workspace files.
          </span>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || files.length === 0}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Material'}</span>
          </button>
        </div>
      </div>

      {/* Result Display Card */}
      {generatedText && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet font-mono text-[10px] font-bold uppercase tracking-wider border border-brand-violet/20">
              Generated Material
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grounded in Workspace Sources
            </span>
          </div>

          <div className="prose max-w-none text-xs md:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap space-y-4">
            {generatedText}
          </div>
        </div>
      )}
    </div>
  );
}
