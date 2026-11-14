import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Radio,
  FileText,
  Loader2,
  Play,
  Pause,
  Sliders,
} from 'lucide-react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import FormattedContent from '../components/FormattedContent';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function VoiceAssistantPage() {
  const { files } = useFiles();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your NexusMind Voice Assistant. Click the microphone and ask me anything about your uploaded documents, images, audio, or video files.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechSynthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const englishVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google'));
        if (englishVoice) setSelectedVoice(englishVoice.name);
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleUserSpeech(transcript.trim());
      }
    } else {
      setTranscript('');
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const handleUserSpeech = async (spokenText: string) => {
    if (!spokenText) return;

    const userMsg: VoiceMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setIsProcessing(true);

    try {
      // Call live grounded multimodal AI
      const res = await api.post('/ai/ask', {
        question: spokenText,
      });

      const replyText =
        res.data?.reply || res.data?.answer || 'I analyzed your library and found no matching answer.';

      const aiMsg: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakResponse(replyText);
    } catch (err: any) {
      const errorMsg: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue accessing your knowledge library. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols for smooth natural vocalization
    const plainText = text
      .replace(/[#*_`$]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\\(?:text|Omega|approx|cdot)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = speechRate;

    if (selectedVoice) {
      const voiceObj = availableVoices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4 text-brand-violet animate-pulse" />
            Live Voice Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            AI Voice Conversation Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hands-free multimodal discussion. Ask questions orally and listen to grounded answers synthesized directly from your uploaded materials.
          </p>
        </div>

        {/* Speed and Voice Controls */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Speed:</span>
            {[0.9, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  speechRate === rate
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Visualizer Orb & Big Mic */}
      <div className="bg-gradient-to-b from-navy-900 via-navy-950 to-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-xl min-h-[260px]">
        {/* Animated Soundwave Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div
            className={`w-64 h-64 rounded-full border border-violet-400 ${
              isListening || isSpeaking ? 'animate-ping' : ''
            }`}
          ></div>
          <div
            className={`w-96 h-96 rounded-full border border-violet-500 ${
              isListening || isSpeaking ? 'animate-pulse' : ''
            }`}
          ></div>
        </div>

        {/* Voice Orb Button */}
        <div className="relative z-10 flex flex-col items-center">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-rose-500 text-white scale-110 ring-8 ring-rose-500/30 animate-pulse'
                : isProcessing
                ? 'bg-brand-violet text-white scale-105 ring-8 ring-brand-violet/30'
                : isSpeaking
                ? 'bg-emerald-500 text-white scale-105 ring-8 ring-emerald-500/30'
                : 'bg-white text-navy-900 hover:scale-105 hover:bg-slate-100'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 text-navy-900" />
            )}
          </button>

          {/* Current State Text */}
          <div className="mt-4 font-bold text-sm tracking-wide">
            {isListening ? (
              <span className="text-rose-400">Listening to your voice... (Click to Send)</span>
            ) : isProcessing ? (
              <span className="text-violet-300">Searching your library & synthesizing response...</span>
            ) : isSpeaking ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <span>Speaking response...</span>
                <button
                  onClick={stopSpeaking}
                  className="px-2 py-0.5 rounded bg-white/20 text-white text-xs hover:bg-white/30"
                >
                  Mute
                </button>
              </div>
            ) : (
              <span className="text-slate-300">Click microphone to start voice inquiry</span>
            )}
          </div>

          {/* Live speech transcription preview */}
          {transcript && (
            <div className="mt-4 max-w-lg px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs text-white border border-white/20 italic">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Spoken Conversation Transcript */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Conversation Transcript
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Grounded against {files.length} library sources
          </span>
        </div>

        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-navy-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="font-semibold text-[10px] uppercase tracking-wider mb-1 opacity-70">
                  {msg.sender === 'user' ? 'You (Voice)' : 'NexusMind Assistant'} • {msg.timestamp}
                </div>
                <FormattedContent content={msg.text} />
              </div>
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => speakResponse(msg.text)}
                  className="mt-1 text-[11px] font-semibold text-brand-violet hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Replay Voice
                </button>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
