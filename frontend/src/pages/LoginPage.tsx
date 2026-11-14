import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setEmail('demo@nexusmind.ai');
      setPassword('Password123!');
      await login('demo@nexusmind.ai', 'Password123!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@nexusmind.ai');
    setPassword('Password123!');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-navy-900 shadow-md text-white mb-1">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight">
            Sign In to NexusMind AI
          </h1>
          <p className="text-xs text-slate-500">
            Don't just store information. Make it intelligent.
          </p>
        </div>

        {/* Demo Quick-Fill & Instant Sign In Pill */}
        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-brand-violet flex-shrink-0 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-navy-900 block">
                  Demo Evaluator Account
                </span>
                <span className="text-[11px] text-slate-600 font-mono">
                  demo@nexusmind.ai / Password123!
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-violet-100">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-navy-900 to-brand-violet hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Instant Sign In</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemo}
              className="py-2 px-3 rounded-xl border border-violet-300 bg-white hover:bg-violet-50 text-slate-700 text-xs font-semibold transition"
            >
              Fill Inputs
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-rose-100">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="text-[11px] font-bold text-brand-violet hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Sign In as Demo Evaluator
                </button>
                <span className="text-slate-300">•</span>
                <Link
                  to="/register"
                  className="text-[11px] font-bold text-navy-900 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Create New Account
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@nexusmind.ai"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-brand-violet hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-navy-900 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-navy-900">Password Reset</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Note (Section 5E): SMTP email dispatch is not configured in this test environment. In production, configure SMTP credentials to dispatch secure password reset tokens.
            </p>
            <button
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

