import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import FormattedContent from '../components/FormattedContent';
import {
  BrainCircuit,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  Zap,
  ChevronRight,
  ChevronDown,
  Shuffle,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  Clock,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceLabel: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceLabel: string;
  category?: string;
}

export default function QuizStudioPage() {
  const [searchParams] = useSearchParams();
  const initialFileId = searchParams.get('fileId');

  const { files } = useFiles();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    initialFileId ? [initialFileId] : []
  );

  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'review'>('quiz');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Loading & State
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Interactive Quiz Player State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Review Accordion State
  const [expandedReview, setExpandedReview] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (initialFileId && !selectedFileIds.includes(initialFileId)) {
      setSelectedFileIds([initialFileId]);
    }
  }, [initialFileId]);

  const toggleFileSelect = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedFiles = files.filter((f) => selectedFileIds.includes(f.id));

  // 1. Generate Quiz
  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true);
      const effectiveTopic =
        topic.trim() ||
        (selectedFiles.length > 0
          ? selectedFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') + ' Quiz'
          : 'Workspace Knowledge Quiz');

      const res: any = await api.post('/ai/generate-quiz', {
        topic: effectiveTopic,
        fileIds: selectedFileIds,
        count: questionCount,
        difficulty,
      });

      if (res.success && res.data?.questions) {
        setQuizQuestions(res.data.questions);
        setCurrentQIndex(0);
        setSelectedAnswers({});
        setIsQuizCompleted(false);

        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate Flashcards
  const handleGenerateFlashcards = async () => {
    try {
      setIsGenerating(true);
      const effectiveTopic =
        topic.trim() ||
        (selectedFiles.length > 0
          ? selectedFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') + ' Flashcards'
          : 'Core Concepts Flashcards');

      const res: any = await api.post('/ai/generate-flashcards', {
        topic: effectiveTopic,
        fileIds: selectedFileIds,
        count: 6,
      });

      if (res.success && res.data?.flashcards) {
        setFlashcards(res.data.flashcards);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setMasteredCards(new Set());
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle answering question in Quiz Player
  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered

    const updated = { ...selectedAnswers, [qIdx]: optionIdx };
    setSelectedAnswers(updated);

    // If answer is correct
    if (optionIdx === quizQuestions[qIdx].correctIndex) {
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
        });
      } catch {}
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsQuizCompleted(false);
  };

  // Score Calculation
  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    const q = quizQuestions[parseInt(qIdx, 10)];
    return q && q.correctIndex === ansIdx ? acc + 1 : acc;
  }, 0);

  const scorePercentage =
    quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-violet uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Interactive AI Learning Arena</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
            AI Quiz & Knowledge Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Generate interactive quizzes, 3D study flashcards, and exam preparation from any PDF or document.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-violet" />
            <span>Interactive Quiz</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('flashcards');
              if (flashcards.length === 0) handleGenerateFlashcards();
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-teal" />
            <span>3D Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'review'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Q&A Cheat Sheet</span>
          </button>
        </div>
      </div>

      {/* Control & Configuration Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Source selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Select Source Materials to Quiz From:
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedFileIds.length === 0
                ? 'All workspace files included'
                : `${selectedFileIds.length} of ${files.length} selected`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => toggleFileSelect(file.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    isSelected
                      ? 'border-brand-violet bg-brand-violet/10 ring-1 ring-brand-violet/30'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1 rounded-md bg-white border border-slate-200 flex-shrink-0">
                    {file.modality === 'document' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                    {file.modality === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                    {file.modality === 'audio' && <Music className="w-3.5 h-3.5 text-amber-600" />}
                    {file.modality === 'video' && <Film className="w-3.5 h-3.5 text-purple-600" />}
                    {file.modality === 'text' && <FileText className="w-3.5 h-3.5 text-slate-600" />}
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {file.original_name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {file.modality}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-violet flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Topic & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-bold text-slate-700">Specific Topic Focus (Optional):</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Superposition Theorem, Mesh Analysis, Kirchhoff Laws..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-navy-900 transition font-medium"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700">Questions Count:</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-navy-900 transition font-medium"
            >
              <option value={3}>3 Questions (Quick Sprint)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Comprehensive)</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700">Difficulty Level:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-navy-900 transition font-medium"
            >
              <option value="easy">Fundamental (Easy)</option>
              <option value="medium">Applied (Medium)</option>
              <option value="hard">Challenging (Hard)</option>
            </select>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={activeTab === 'flashcards' ? handleGenerateFlashcards : handleGenerateQuiz}
            disabled={isGenerating || files.length === 0}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span>
              {isGenerating
                ? 'Synthesizing with AI...'
                : activeTab === 'flashcards'
                ? 'Generate Study Flashcards'
                : 'Generate Interactive Quiz'}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PLAYABLE INTERACTIVE QUIZ GAME */}
      {/* ======================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {quizQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center mx-auto">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-navy-900">
                  Ready to Test Your Knowledge?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click <strong>"Generate Interactive Quiz"</strong> above to extract real multiple-choice questions, formulas, and verified explanations from your uploaded materials.
                </p>
              </div>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || files.length === 0}
                className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-brand-teal" />
                <span>Generate Sample Quiz Now</span>
              </button>
            </div>
          ) : isQuizCompleted ? (
            /* Quiz Completion Screen */
            <div className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Quiz Completed
                </span>
                <h2 className="text-3xl font-black text-navy-900 pt-2">
                  {scorePercentage >= 80
                    ? '🎉 Outstanding Mastery!'
                    : scorePercentage >= 60
                    ? '👍 Good Effort!'
                    : '📚 Keep Practicing!'}
                </h2>
                <p className="text-xs text-slate-500">
                  You scored <strong className="text-navy-900">{score}</strong> out of{' '}
                  <strong className="text-navy-900">{quizQuestions.length}</strong> questions ({scorePercentage}% accuracy)
                </p>
              </div>

              {/* Score Bar */}
              <div className="max-w-md mx-auto w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    scorePercentage >= 80
                      ? 'bg-emerald-500'
                      : scorePercentage >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={handleGenerateQuiz}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-brand-violet" />
                  <span>Generate New Questions</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Question Card */
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 animate-fadeIn">
              {/* Progress & Tracker Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold">
                    Question {currentQIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 capitalize">
                    Difficulty: {quizQuestions[currentQIndex]?.difficulty || 'Medium'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    Score: {score} / {Object.keys(selectedAnswers).length}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-bold text-navy-900 leading-snug">
                  <FormattedContent content={quizQuestions[currentQIndex]?.question || ''} />
                </h3>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-2.5">
                {quizQuestions[currentQIndex]?.options.map((option, optIdx) => {
                  const isAnswered = selectedAnswers[currentQIndex] !== undefined;
                  const isUserSelection = selectedAnswers[currentQIndex] === optIdx;
                  const isCorrect = quizQuestions[currentQIndex].correctIndex === optIdx;

                  let buttonStyle = 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-800';

                  if (isAnswered) {
                    if (isCorrect) {
                      buttonStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                    } else if (isUserSelection) {
                      buttonStyle = 'border-rose-400 bg-rose-50/70 text-rose-900 font-bold ring-2 ring-rose-400/20';
                    } else {
                      buttonStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(currentQIndex, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition flex items-center justify-between space-x-3 shadow-sm ${buttonStyle}`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 text-navy-900 shadow-2xs">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <div className="flex-1">
                          <FormattedContent content={option} />
                        </div>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                      {isAnswered && isUserSelection && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Callout (appears once answered) */}
              {selectedAnswers[currentQIndex] !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-brand-violet uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verified Grounded Explanation</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {quizQuestions[currentQIndex]?.sourceLabel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <FormattedContent content={quizQuestions[currentQIndex]?.explanation || ''} />
                  </div>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-navy-900 transition flex items-center space-x-1 disabled:opacity-40"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={selectedAnswers[currentQIndex] === undefined}
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-navy-900/10 disabled:opacity-40"
                >
                  <span>{currentQIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INTERACTIVE 3D FLASHCARDS */}
      {/* ======================================================== */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {flashcards.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-navy-900">Study Flashcards</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate interactive flip cards for key definitions, formulas, and laws extracted from your documents.
                </p>
              </div>
              <button
                onClick={handleGenerateFlashcards}
                disabled={isGenerating || files.length === 0}
                className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-brand-teal" />
                <span>Generate Flashcards Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress & Controls */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="font-mono">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Mastered: {masteredCards.size} / {flashcards.length}
                </span>
              </div>

              {/* Flashcard Component */}
              <div
                onClick={() => setIsCardFlipped((prev) => !prev)}
                className="cursor-pointer min-h-[260px] p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-brand-violet/40 shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-100 pb-3">
                  <span className="px-2 py-0.5 rounded-md bg-brand-violet/10 text-brand-violet font-bold uppercase tracking-wider">
                    {flashcards[currentCardIndex]?.category || 'Concept'}
                  </span>
                  <span className="text-slate-400">
                    {isCardFlipped ? 'Answer (Click to flip back)' : 'Question (Click to flip)'}
                  </span>
                </div>

                <div className="py-6 my-auto text-center space-y-3">
                  <div className="text-base md:text-xl font-black text-navy-900 max-w-lg mx-auto leading-relaxed">
                    <FormattedContent
                      content={
                        isCardFlipped
                          ? flashcards[currentCardIndex]?.back || ''
                          : flashcards[currentCardIndex]?.front || ''
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-3 text-slate-400">
                  <span className="font-mono">{flashcards[currentCardIndex]?.sourceLabel}</span>
                  <span className="text-brand-violet font-semibold group-hover:underline">
                    🔄 Click anywhere to flip
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((prev) => prev - 1);
                    setIsCardFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-navy-900 transition flex items-center space-x-1.5 disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMasteredCards((prev) => {
                        const next = new Set(prev);
                        if (next.has(currentCardIndex)) {
                          next.delete(currentCardIndex);
                        } else {
                          next.add(currentCardIndex);
                          try {
                            confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
                          } catch {}
                        }
                        return next;
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                      masteredCards.has(currentCardIndex)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{masteredCards.has(currentCardIndex) ? 'Mastered' : 'Mark as Mastered'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCardFlipped((prev) => !prev)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Flip</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={currentCardIndex === flashcards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((prev) => prev + 1);
                    setIsCardFlipped(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-40 shadow-sm"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: Q&A CHEAT SHEET ACCORDION */}
      {/* ======================================================== */}
      {activeTab === 'review' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900">
                Exam Preparation & Solutions Cheat Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Click any question to reveal verified answers and derivations from your documents.
              </p>
            </div>
            {quizQuestions.length > 0 && (
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            )}
          </div>

          {quizQuestions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No questions generated yet. Switch to "Interactive Quiz" and click "Generate Interactive Quiz".
            </div>
          ) : (
            <div className="space-y-3">
              {quizQuestions.map((q, qIdx) => {
                const isOpen = expandedReview[qIdx] ?? false;
                return (
                  <div
                    key={q.id || qIdx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReview((prev) => ({ ...prev, [qIdx]: !isOpen }))
                      }
                      className="w-full p-4 text-left flex items-start justify-between space-x-3 hover:bg-slate-100/70 transition"
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="px-2 py-0.5 rounded-md bg-navy-900 text-white font-mono font-bold text-[10px] mt-0.5">
                          Q{qIdx + 1}
                        </span>
                        <div className="text-xs font-bold text-slate-800 flex-1 leading-snug">
                          <FormattedContent content={q.question} />
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-2 border-t border-slate-200/80 bg-white space-y-3 text-xs text-slate-700 animate-fadeIn">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            Correct Answer:
                          </span>
                          <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-bold">
                            <FormattedContent content={q.options[q.correctIndex]} />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Explanation & Source:
                          </span>
                          <div className="leading-relaxed text-slate-600">
                            <FormattedContent content={q.explanation} />
                          </div>
                          <span className="text-[10px] font-mono text-brand-violet block mt-1.5">
                            📍 Source: {q.sourceLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
