import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquareText,
  Network,
  Sparkles,
  Search,
  BookOpen,
  ShieldCheck,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { useFiles } from '../context/FileContext';

export default function Sidebar() {
  const { files } = useFiles();

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      badge: null,
    },
    {
      to: '/library',
      icon: FolderOpen,
      label: 'Knowledge Library',
      badge: files.length > 0 ? `${files.length}` : null,
    },
    {
      to: '/chat',
      icon: MessageSquareText,
      label: 'AI Assistant',
      badge: 'RAG',
    },
    {
      to: '/connected-intelligence',
      icon: Network,
      label: 'Connected Intelligence',
      badge: 'Core',
      highlight: true,
    },
    {
      to: '/quiz',
      icon: BrainCircuit,
      label: 'AI Quiz Studio',
      badge: 'Interactive',
    },
    {
      to: '/content-studio',
      icon: Sparkles,
      label: 'Content Studio',
      badge: null,
    },
    {
      to: '/search',
      icon: Search,
      label: 'Global Search',
      badge: null,
    },
    {
      to: '/docs',
      icon: BookOpen,
      label: 'Documentation',
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white hidden xl:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Multimodal Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-navy-900 to-brand-violet text-white shadow-sm'
                          : 'bg-navy-900 text-white shadow-sm'
                        : item.highlight
                        ? 'text-brand-violet hover:bg-brand-violet/10 font-bold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        item.highlight
                          ? 'bg-brand-violet/20 text-brand-violet'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Grounded Intelligence Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
        <div className="flex items-center space-x-2 text-xs font-bold text-navy-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Grounded Intelligence</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Grounded cross-modal reasoning with exact source citations across documents, images, audio & video.
        </p>
      </div>
    </aside>
  );
}

