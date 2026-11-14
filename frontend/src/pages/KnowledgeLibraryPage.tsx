import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import {
  FolderOpen,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Music,
  Film,
  ExternalLink,
  Trash2,
  RotateCcw,
  Eye,
  MessageSquareText,
  X,
  Upload,
} from 'lucide-react';
import { FileRecord } from '../types';
import FileUploaderModal from '../components/FileUploaderModal';
import AudioPlayerCard from '../components/AudioPlayerCard';
import VideoPlayerCard from '../components/VideoPlayerCard';

export default function KnowledgeLibraryPage() {
  const { files, deleteFile, retryProcessing } = useFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = files.filter((f) => {
    if (selectedModality !== 'all' && f.modality !== selectedModality) return false;
    if (selectedStatus !== 'all' && f.processing_status !== selectedStatus) return false;
    if (searchQuery.trim() && !f.original_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center space-x-2">
            <FolderOpen className="w-6 h-6 text-brand-violet" />
            <span>Knowledge Library</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, inspect, and interrogate all ingested multimodal artifacts ({files.length} total)
          </p>
        </div>

        <button
          onClick={() => setUploaderOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-sm transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Artifact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 flex-wrap gap-2 w-full md:w-auto">
          {/* Modality Filter */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'document', label: 'Docs' },
              { id: 'image', label: 'Images' },
              { id: 'audio', label: 'Audio' },
              { id: 'video', label: 'Video' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedModality(tab.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  selectedModality === tab.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Processed">Processed</option>
            <option value="Processing">Processing</option>
            <option value="Queued">Queued</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Grid of Files */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No matching files found</h4>
          <p className="text-xs text-slate-400">
            Try adjusting your search criteria or upload a new file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 flex-shrink-0">
                    {file.modality === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                    {file.modality === 'image' && <ImageIcon className="w-5 h-5 text-emerald-600" />}
                    {file.modality === 'audio' && <Music className="w-5 h-5 text-amber-600" />}
                    {file.modality === 'video' && <Film className="w-5 h-5 text-purple-600" />}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      file.processing_status === 'Processed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : file.processing_status === 'Processing'
                        ? 'bg-amber-50 text-amber-700 animate-pulse'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {file.processing_status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-navy-900 line-clamp-1 group-hover:text-brand-violet transition">
                    {file.original_name}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="uppercase">{file.modality}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedFile(file)}
                  className="flex items-center space-x-1.5 text-navy-900 hover:text-brand-violet font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Extractions</span>
                </button>

                <div className="flex items-center space-x-1">
                  {file.processing_status === 'Failed' && (
                    <button
                      onClick={() => retryProcessing(file.id)}
                      className="p-1 text-slate-400 hover:text-navy-900"
                      title="Retry Processing"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={`/api/files/${file.id}/stream`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-navy-900"
                    title="View Raw Stream"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Detail Modal Drawer */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="truncate pr-4">
                <h3 className="text-sm font-bold text-navy-900 truncate">
                  {selectedFile.original_name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(selectedFile.file_size / 1024).toFixed(1)} KB • {selectedFile.modality.toUpperCase()} • Status: {selectedFile.processing_status}
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Media Preview Player */}
              {selectedFile.modality === 'audio' && <AudioPlayerCard file={selectedFile} />}
              {selectedFile.modality === 'video' && <VideoPlayerCard file={selectedFile} />}
              {selectedFile.modality === 'image' && (
                <div className="aspect-video bg-black/5 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={`/api/files/${selectedFile.id}/stream`}
                    alt={selectedFile.original_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Extracted Chunks / Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Extracted Content & Analysis
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {`Modality: ${selectedFile.modality.toUpperCase()}\nStatus: ${selectedFile.processing_status}\nIngested & indexed for grounded RAG and cross-modal reasoning.`}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const targetId = selectedFile.id;
                  setSelectedFile(null);
                  navigate(`/chat?fileId=${targetId}`);
                }}
                className="px-4 py-2 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Ask AI About This File</span>
              </button>

              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <FileUploaderModal isOpen={uploaderOpen} onClose={() => setUploaderOpen(false)} />
    </div>
  );
}

