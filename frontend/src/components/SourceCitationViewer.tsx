import React from 'react';
import { X, ExternalLink, FileSearch, CheckCircle2 } from 'lucide-react';
import { MessageSource } from '../types';

interface SourceCitationViewerProps {
  source: MessageSource | null;
  onClose: () => void;
}

export default function SourceCitationViewer({ source, onClose }: SourceCitationViewerProps) {
  if (!source) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between animate-slideLeft">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-navy-900">
            <FileSearch className="w-4 h-4 text-brand-violet" />
            <span>Verified Grounded Source</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Source Identification
          </span>
          <h4 className="text-sm font-bold text-navy-900 leading-snug">
            {source.source_label}
          </h4>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Source Type:</span>
            <span className="font-semibold capitalize text-slate-800">{source.source_type}</span>
          </div>
          {source.page_number && (
            <div className="flex justify-between text-slate-600">
              <span>Page Number:</span>
              <span className="font-semibold text-slate-800">Page {source.page_number}</span>
            </div>
          )}
          {source.timestamp && (
            <div className="flex justify-between text-slate-600">
              <span>Acoustic Timestamp:</span>
              <span className="font-mono font-semibold text-slate-800">{source.timestamp}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>RAG Relevance:</span>
            <span className="font-mono font-bold text-emerald-600">
              {source.relevance_score ? `${(source.relevance_score * 100).toFixed(0)}%` : 'High'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>
            Verified by NexusMind Grounding Engine. The generated answer is derived directly from this file's extracted content.
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <a
          href={`/api/files/${source.file_id}/stream`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition"
        >
          <span>Open Raw File</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
