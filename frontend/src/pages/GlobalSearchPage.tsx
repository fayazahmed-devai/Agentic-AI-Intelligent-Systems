import React, { useState } from 'react';
import api from '../services/api';
import {
  Search,
  FileText,
  Image as ImageIcon,
  Music,
  Film,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SearchResultItem } from '../types';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const res: any = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
      if (res.success && res.data) {
        setResults(res.data);
      }
      setHasSearched(true);
    } catch (err: any) {
      alert(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center space-x-2">
          <Search className="w-6 h-6 text-brand-teal" />
          <span>Global Multimodal Search</span>
        </h1>
        <p className="text-xs text-slate-500">
          Query across document chunks, image descriptions, audio transcripts, and video frames simultaneously.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="max-w-3xl flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any concept, formula, spoken remark, or diagram label..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 shadow-sm transition font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Found {results.length} cross-modal match(es)</span>
            <span className="font-mono">Ranked by relevance score</span>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No matches found in your workspace files. Try a different query term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0">
                        {item.modality === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
                        {item.modality === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                        {item.modality === 'audio' && <Music className="w-4 h-4 text-amber-600" />}
                        {item.modality === 'video' && <Film className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-navy-900">{item.sourceLabel}</h4>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {item.modality}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`/api/files/${item.fileId}/stream`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-navy-900 text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>Open File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{item.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
