import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import {
  Layers,
  Sparkles,
  Upload,
  FolderOpen,
  MessageSquareText,
  Network,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import FileUploaderModal from '../components/FileUploaderModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, stats, activities, deleteFile } = useFiles();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const navigate = useNavigate();

  const totalFiles = stats?.totalFiles || files.length;
  const processedFiles =
    stats?.processedFiles ||
    files.filter((f) => f.processing_status === 'Processed').length;
  const storageUsedMB = (
    (stats?.storageUsedBytes ||
      files.reduce((acc, f) => acc + (f.file_size || 0), 0)) /
    (1024 * 1024)
  ).toFixed(2);
  const questionsAsked = stats?.questionsAsked || 0;

  // Chart data for modality distribution
  const chartData = [
    { name: 'Documents', value: stats?.modalityCounts?.document || 0, color: '#3b82f6' },
    { name: 'Images', value: stats?.modalityCounts?.image || 0, color: '#10b981' },
    { name: 'Audio', value: stats?.modalityCounts?.audio || 0, color: '#f59e0b' },
    { name: 'Video', value: stats?.modalityCounts?.video || 0, color: '#8b5cf6' },
  ].filter((item) => item.value > 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Area (Section 6) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
            Welcome back, {user?.full_name || 'Investigator'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Your knowledge, connected intelligently.
          </p>
        </div>

        <button
          onClick={() => setUploaderOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Uploads
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{totalFiles}</div>
          <span className="text-[11px] text-slate-500">Across all 5 modalities</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Processed Files
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{processedFiles}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalFiles > 0 ? `${((processedFiles / totalFiles) * 100).toFixed(0)}% ready for RAG` : 'Ready'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Storage Used
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{storageUsedMB} <span className="text-sm font-sans font-bold text-slate-400">MB</span></div>
          <span className="text-[11px] text-slate-500">Private storage allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Questions Asked
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <MessageSquareText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-navy-900">{questionsAsked}</div>
          <span className="text-[11px] text-amber-600 font-semibold">Grounded AI inquiries</span>
        </div>
      </div>

      {/* Main Actions Bar (Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setUploaderOpen(true)}
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-navy-900">Upload Files</h4>
            <p className="text-[11px] text-slate-500">PDFs, images, audio, video</p>
          </div>
          <Upload className="w-4 h-4 text-slate-400 group-hover:text-navy-900 transition" />
        </button>

        <Link
          to="/chat"
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-navy-900">Open AI Assistant</h4>
            <p className="text-[11px] text-slate-500">Ask questions with citations</p>
          </div>
          <MessageSquareText className="w-4 h-4 text-slate-400 group-hover:text-navy-900 transition" />
        </Link>

        <Link
          to="/library"
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-navy-900">Knowledge Library</h4>
            <p className="text-[11px] text-slate-500">Browse & filter ingested assets</p>
          </div>
          <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-navy-900 transition" />
        </Link>

        <Link
          to="/connected-intelligence"
          className="p-4 rounded-xl bg-gradient-to-r from-navy-900 to-brand-violet hover:opacity-95 text-white shadow-sm transition text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">Connected Intelligence</h4>
            <p className="text-[11px] text-slate-200">Cross-modal synthesis</p>
          </div>
          <Network className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Featured Showcase Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-brand-violet text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold uppercase tracking-wider border border-white/20">
            Featured Multimodal Workspace
          </span>
          <h3 className="text-lg font-bold">
            Multimodal Dynamics Synthesis: 4 Modalities Connected
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            The workspace is loaded with a sample physics textbook chapter (<code className="text-white">.pdf</code>), handwritten diagram (<code className="text-white">.png</code>), lecture audio (<code className="text-white">.mp3</code>), and pendulum experiment video (<code className="text-white">.mp4</code>).
          </p>
        </div>
        <Link
          to="/connected-intelligence"
          className="px-5 py-2.5 rounded-xl bg-white text-navy-900 hover:bg-slate-100 text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0"
        >
          <span>Run Cross-Modal Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Two-Column: Recent Files + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Files Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-brand-violet" />
              <span>Recent Workspace Files</span>
            </h3>
            <Link to="/library" className="text-xs text-brand-violet font-semibold hover:underline">
              View all ({files.length})
            </Link>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p>No files uploaded yet. Click Upload Files to begin.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {files.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="py-3 flex items-center justify-between space-x-3 text-xs"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                      {file.modality === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
                      {file.modality === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                      {file.modality === 'audio' && <Music className="w-4 h-4 text-amber-600" />}
                      {file.modality === 'video' && <Film className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="truncate">
                      <h5 className="font-semibold text-slate-800 truncate">
                        {file.original_name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(file.file_size / 1024).toFixed(1)} KB • {file.modality.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        file.processing_status === 'Processed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : file.processing_status === 'Processing'
                          ? 'bg-amber-50 text-amber-700 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {file.processing_status}
                    </span>

                    <a
                      href={`/api/files/${file.id}/stream`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-navy-900"
                      title="Open File Stream"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            <span>Recent Activity</span>
          </h3>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recent activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-violet mt-1.5 flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FileUploaderModal isOpen={uploaderOpen} onClose={() => setUploaderOpen(false)} />
    </div>
  );
}

