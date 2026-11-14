import React, { useState } from 'react';
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
  Cpu,
} from 'lucide-react';

export default function Navbar({ onOpenUpload }: { onOpenUpload?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/library', label: 'Knowledge Library' },
    { to: '/chat', label: 'AI Assistant' },
    { to: '/connected-intelligence', label: 'Connected Intelligence' },
    { to: '/content-studio', label: 'Content Studio' },
    { to: '/search', label: 'Search' },
    { to: '/docs', label: 'Documentation' },
  ];

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
              One Workspace. Every Format. Connected Intelligence.
            </p>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links (when authenticated) */}
      {user && (
        <nav className="hidden xl:flex items-center space-x-1 text-xs font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive
                    ? 'bg-navy-900 text-white font-semibold'
                    : 'hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
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
        <div className="xl:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl space-y-2 z-50">
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
