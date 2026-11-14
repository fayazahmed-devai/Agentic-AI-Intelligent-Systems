import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Sparkles,
  LogOut,
  Upload,
  Search,
  BookOpen,
  Menu,
  X,
  User as UserIcon,
  Languages,
  ChevronDown,
  Check,
} from 'lucide-react';
import api from '../services/api';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export default function Navbar({ onOpenUpload }: { onOpenUpload?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('en');

  useEffect(() => {
    if (user) {
      api.get('/preferences')
        .then((res) => {
          if (res.data?.preferred_language) {
            setCurrentLang(res.data.preferred_language);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSelectLanguage = async (code: string) => {
    setCurrentLang(code);
    setLangMenuOpen(false);
    try {
      await api.put('/preferences', { preferred_language: code });
    } catch (err) {
      console.error('Failed to update language preference', err);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/library', label: 'Library' },
    { to: '/connected-intelligence', label: 'Connected' },
    { to: '/detective', label: 'Detective' },
    { to: '/graph', label: 'Graph' },
    { to: '/voice', label: 'Voice' },
    { to: '/mentor', label: 'Mentor' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/research-agent', label: 'Research' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/docs', label: 'Docs' },
  ];

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-navy-900 p-2 flex items-center justify-center text-white shadow-md shadow-navy-900/10 group-hover:bg-brand-violet transition">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-navy-900">
                NexusMind
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-brand-violet/10 text-brand-violet font-mono border border-brand-violet/20">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block tracking-wide">
              Don't just store information. Make it intelligent.
            </p>
          </div>
        </Link>
      </div>

      {/* Language Selector & Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Languages className="w-3.5 h-3.5 text-brand-violet" />
            <span className="hidden sm:inline">{activeLangObj.native}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Multilingual AI
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{lang.native}</span>
                    <span className="text-[10px] text-slate-400">{lang.label}</span>
                  </div>
                  {currentLang === lang.code && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <>
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Files</span>
              </button>
            )}

            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl space-y-2 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {user &&
            navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.to
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          {!user && (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
