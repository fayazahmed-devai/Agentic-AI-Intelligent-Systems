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
  BrainCircuit,
  SearchCheck,
  Mic,
  GraduationCap,
  Bot,
  Compass,
} from 'lucide-react';
import { useFiles } from '../context/FileContext';

export default function Sidebar() {
  const { files } = useFiles();

  const coreNavItems = [
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
      to: '/connected-intelligence',
      icon: Compass,
      label: 'Connected Intelligence',
      badge: 'Core',
      highlight: true,
    },
    {
      to: '/chat',
      icon: MessageSquareText,
      label: 'AI Assistant',
      badge: 'RAG',
    },
  ];

  const advancedAiItems = [
    {
      to: '/detective',
      icon: SearchCheck,
      label: 'AI Knowledge Detective',
      badge: 'Forensic',
    },
    {
      to: '/graph',
      icon: Network,
      label: 'Knowledge Graph',
      badge: 'Visual',
    },
    {
      to: '/voice',
      icon: Mic,
      label: 'Voice Assistant',
      badge: 'Audio',
    },
    {
      to: '/mentor',
      icon: GraduationCap,
      label: 'Learning Mentor',
      badge: '5 Depths',
    },
    {
      to: '/evidence',
      icon: ShieldCheck,
      label: 'Evidence & Trust',
      badge: 'Audited',
    },
    {
      to: '/research-agent',
      icon: Bot,
      label: 'Research Agent',
      badge: 'Autonomous',
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
  ];

  const utilityItems = [
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
    <aside className="w-64 border-r border-slate-200 bg-white hidden xl:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Core Workspace */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Multimodal Workspace
          </div>
          <nav className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
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
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 font-mono text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Advanced Intelligence Section */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Advanced Intelligence</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-brand-violet font-mono font-bold">
              Part 2
            </span>
          </div>
          <nav className="space-y-1">
            {advancedAiItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className="w-4 h-4 flex-shrink-0 text-brand-violet" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-100 font-mono text-slate-500 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Reference */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Reference
          </div>
          <nav className="space-y-1">
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
          <div className="font-bold text-navy-900">NexusMind Intelligence</div>
          <p className="text-slate-500 leading-tight">
            Gemini 3.5 Flash Lite • Multimodal SQL Grounded
          </p>
        </div>
      </div>
    </aside>
  );
}
