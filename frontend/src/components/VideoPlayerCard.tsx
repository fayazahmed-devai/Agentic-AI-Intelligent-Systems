import React, { useRef } from 'react';
import { Film, Bookmark } from 'lucide-react';
import { FileRecord } from '../types';

export default function VideoPlayerCard({ file }: { file: FileRecord }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamUrl = `/api/files/${file.id}/stream`;

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play();
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center space-x-2.5 truncate">
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
          <Film className="w-4 h-4" />
        </div>
        <div className="truncate">
          <h5 className="text-xs font-bold text-navy-900 truncate">{file.original_name}</h5>
          <span className="text-[10px] text-slate-500 font-mono">
            {(file.file_size / (1024 * 1024)).toFixed(1)} MB • Video Stream
          </span>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} src={streamUrl} controls className="w-full h-full object-contain" />
      </div>

      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
          <Bookmark className="w-3 h-3 text-brand-violet" />
          <span>Keyframe Timestamps</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '00:15 Overview', time: 15 },
            { label: '01:20 Experiment Run', time: 80 },
            { label: '02:45 Conclusion', time: 165 },
          ].map((mark, i) => (
            <button
              key={i}
              onClick={() => seekTo(mark.time)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-medium transition"
            >
              ⏱️ {mark.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

