import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Music } from 'lucide-react';
import { FileRecord } from '../types';

export default function AudioPlayerCard({ file }: { file: FileRecord }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const streamUrl = `/api/files/${file.id}/stream`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const formatSec = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Music className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h5 className="text-xs font-bold text-navy-900 truncate">{file.original_name}</h5>
            <span className="text-[10px] text-slate-500 font-mono">
              {(file.file_size / 1024).toFixed(1)} KB • Audio Recording
            </span>
          </div>
        </div>

        <button
          onClick={cycleSpeed}
          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          {playbackRate}x
        </button>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{formatSec(currentTime)}</span>
          <span>{formatSec(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 pt-1">
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900"
          title="Rewind 5s"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white shadow-sm transition"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900"
          title="Forward 5s"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

