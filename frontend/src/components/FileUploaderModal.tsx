import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Mic,
  Camera,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Square,
  RotateCcw,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { useFiles } from '../context/FileContext';

interface FileUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploaderModal({ isOpen, onClose }: FileUploaderModalProps) {
  const { uploadFiles } = useFiles();
  const [activeTab, setActiveTab] = useState<'files' | 'mic' | 'camera'>('files');
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Camera capture state
  const [streamActive, setStreamActive] = useState(false);
  const [cameraBlob, setCameraBlob] = useState<Blob | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      setQueuedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const submitBatchUpload = async () => {
    if (queuedFiles.length === 0) return;
    try {
      setIsUploading(true);
      setUploadError('');
      await uploadFiles(queuedFiles);
      setQueuedFiles([]);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Mic controls
  const startRecording = async () => {
    try {
      setUploadError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setIsRecording(true);
    } catch (err: any) {
      setUploadError('Microphone permission denied or device not found.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVoiceMemo = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `Voice_Testimony_${Date.now()}.wav`, {
      type: 'audio/wav',
    });
    try {
      setIsUploading(true);
      await uploadFiles([file]);
      onClose();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Camera controls
  const startCamera = async () => {
    try {
      setUploadError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActive(true);
    } catch (err) {
      setUploadError('Camera permission denied or camera device not found.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          setCameraBlob(blob);
          setCameraPreview(URL.createObjectURL(blob));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const uploadCameraSnapshot = async () => {
    if (!cameraBlob) return;
    const file = new File([cameraBlob], `Camera_Snapshot_${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    try {
      setIsUploading(true);
      await uploadFiles([file]);
      onClose();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-brand-violet" />
              <span>Upload Multimodal Knowledge</span>
            </h3>
            <p className="text-xs text-slate-500">
              Documents, Images, Audio, and Video files for cross-modal intelligence
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'files'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>File Browser</span>
          </button>
          <button
            onClick={() => setActiveTab('mic')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'mic'
                ? 'border-brand-violet text-brand-violet'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Recording</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Capture</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {activeTab === 'files' && (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('nexus-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragOver
                    ? 'border-brand-violet bg-brand-violet/5'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  id="nexus-file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setQueuedFiles((prev) => [
                        ...prev,
                        ...Array.from(e.target.files!),
                      ]);
                    }
                  }}
                />
                <div className="flex justify-center space-x-3 mb-3">
                  <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </span>
                  <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Music className="w-5 h-5" />
                  </span>
                  <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Film className="w-5 h-5" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drag and drop files here, or <span className="text-brand-violet">browse</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supported formats: PDF, DOCX, TXT, Images (PNG, JPG, WEBP), Audio (MP3, WAV, M4A), Video (MP4, MOV, WEBM)
                </p>
              </div>

              {/* Selected file queue */}
              {queuedFiles.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">
                    Queued Files ({queuedFiles.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {queuedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">
                            {file.name}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => setQueuedFiles(queuedFiles.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'mic' && (
            <div className="p-8 text-center space-y-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-white border border-slate-200 shadow-sm">
                <Mic
                  className={`w-8 h-8 ${
                    isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-600'
                  }`}
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isRecording ? 'Recording Live Audio...' : 'Browser Microphone Recording'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Record verbal thoughts, lecture snippets, or interview remarks.
                </p>
              </div>

              {audioUrl && !isRecording && (
                <audio controls src={audioUrl} className="mx-auto max-w-sm w-full" />
              )}

              <div className="flex justify-center space-x-3 pt-2">
                {!isRecording && !audioBlob && (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                )}
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                )}
                {audioBlob && !isRecording && (
                  <>
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium"
                    >
                      Reset
                    </button>
                    <button
                      onClick={uploadVoiceMemo}
                      disabled={isUploading}
                      className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold"
                    >
                      {isUploading ? 'Uploading...' : 'Save & Process Audio'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="p-6 text-center space-y-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative aspect-video max-w-md mx-auto bg-black rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                {streamActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                {cameraPreview && (
                  <img
                    src={cameraPreview}
                    alt="Captured preview"
                    className="w-full h-full object-contain"
                  />
                )}
                {!streamActive && !cameraPreview && (
                  <div className="text-center p-6 text-slate-400 text-xs space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-500 mb-1" />
                    <span>Camera is not active</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                {!streamActive && !cameraPreview && (
                  <button
                    onClick={startCamera}
                    className="px-5 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold shadow-sm"
                  >
                    Enable Camera
                  </button>
                )}
                {streamActive && (
                  <button
                    onClick={capturePhoto}
                    className="px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
                  >
                    Capture Snapshot
                  </button>
                )}
                {cameraPreview && (
                  <>
                    <button
                      onClick={() => {
                        setCameraBlob(null);
                        setCameraPreview(null);
                        startCamera();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-medium"
                    >
                      Retake
                    </button>
                    <button
                      onClick={uploadCameraSnapshot}
                      disabled={isUploading}
                      className="px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
                    >
                      {isUploading ? 'Uploading...' : 'Save & Process Image'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer for File Browser */}
        {activeTab === 'files' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {queuedFiles.length} file(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={submitBatchUpload}
                disabled={queuedFiles.length === 0 || isUploading}
                className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload & Process Files'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
