import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import { Conversation, Message, MessageSource } from '../types';
import SourceCitationViewer from '../components/SourceCitationViewer';
import FormattedContent from '../components/FormattedContent';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialFileId = searchParams.get('fileId');

  const { files } = useFiles();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectedSource, setInspectedSource] = useState<MessageSource | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res: any = await api.get('/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConvId) {
          selectConversation(res.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (id: string) => {
    try {
      setActiveConvId(id);
      const res: any = await api.get(`/conversations/${id}`);
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userQuery = inputText.trim();
    setInputText('');

    // Optimistically render user message
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConvId || '',
      user_id: '',
      role: 'user',
      content: userQuery,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setIsSending(true);
      const res: any = await api.post('/ai/chat', {
        message: userQuery,
        conversationId: activeConvId,
        targetFileIds: initialFileId ? [initialFileId] : [],
      });

      if (res.success && res.data) {
        if (!activeConvId) {
          setActiveConvId(res.data.conversationId);
          loadConversations();
        }
        const assistantMsg: Message = {
          ...res.data.message,
          sources: res.data.sources,
        };
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
      }
    } catch (err: any) {
      alert(err.message || 'AI request failed');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const samplePrompts = [
    'Explain the main concepts across all my uploaded files.',
    'Compare the textbook PDF with the lecture audio recording.',
    'What key formulas and diagrams appear in my notes?',
    'Identify any conflicting information between my sources.',
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      {/* Conversations Drawer (Left Sidebar) */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col justify-between hidden md:flex">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Conversations
            </h3>
            <button
              onClick={startNewChat}
              className="p-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition shadow-sm"
              title="New Exploration"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold truncate transition flex items-center justify-between ${
                  activeConvId === c.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                <span className="truncate pr-2">{c.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
          <span>Grounded RAG Mode Active</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy-900">
                  Grounded Multimodal AI Assistant
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask any question about your documents, images, audio recordings, or videos. Every answer is grounded in your workspace materials.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="w-full space-y-2 pt-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Suggested Questions
                </span>
                <div className="space-y-1.5">
                  {samplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(prompt)}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium transition text-left"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                      isUser
                        ? 'bg-navy-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-slate-500">
                        {isUser ? 'You' : 'NexusMind AI (Grounded Gemini RAG)'}
                      </span>
                      <span className="font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="font-sans leading-relaxed">
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <FormattedContent content={msg.content} />
                      )}
                    </div>

                    {/* Citations Badges (Section 9) */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 font-mono">
                          <FileSearch className="w-3 h-3 text-brand-violet" />
                          <span>Exact Source Citations:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, sIdx) => {
                            const rawLabel =
                              (src as any).source_label ||
                              (src as any).sourceLabel ||
                              (src as any).fileName ||
                              (src as any).file_name;
                            const label =
                              typeof rawLabel === 'string' && rawLabel.trim()
                                ? rawLabel.replace(/â€”/g, '—').replace(/â€“/g, '–').replace(/â€™/g, "'").trim()
                                : `Source #${sIdx + 1}`;
                            return (
                              <button
                                key={src.id || sIdx}
                                onClick={() => setInspectedSource(src)}
                                className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-brand-violet/10 text-navy-900 hover:text-brand-violet text-[10px] font-mono font-semibold border border-slate-200 transition flex items-center space-x-1.5 shadow-2xs hover:border-brand-violet/40"
                                title={`Inspect source citation: ${label}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-violet flex-shrink-0"></span>
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Copy Button */}
                    {!isUser && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-navy-900 font-semibold"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-center space-x-3 text-xs text-slate-500 py-2">
              <div className="w-8 h-8 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-mono text-slate-600">
                Retrieving chunks across modalities & grounding response...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about your uploaded documents, images, audio, or video..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Source Citation Slide-Over Viewer */}
      <SourceCitationViewer
        source={inspectedSource}
        onClose={() => setInspectedSource(null)}
      />
    </div>
  );
}

