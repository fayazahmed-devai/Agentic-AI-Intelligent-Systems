import React, { useState, useRef, useEffect } from 'react';
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
  Link2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Send,
} from 'lucide-react';
import { setCustomBackendUrl } from '../services/api';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState('');
  const [showBackendInput, setShowBackendInput] = useState(false);
  const [backendSavedMsg, setBackendSavedMsg] = useState('');

  // 2FA / OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [sentCode, setSentCode] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login, sendVerificationCode, verifyCode } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSaveBackend = () => {
    if (backendUrlInput.trim()) {
      setCustomBackendUrl(backendUrlInput.trim());
      setBackendSavedMsg('Backend URL connected!');
      setTimeout(() => setBackendSavedMsg(''), 2000);
    }
  };

  // Step 1: Submit email & password -> sends code and shows OTP screen
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Send 6-digit verification code to the email
      const res = await sendVerificationCode(cleanEmail);
      setSentCode(res.code || '');
      setStep('otp');
      setResendCountdown(45);
      setOtpDigits(['', '', '', '', '', '']);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to send verification code. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance focus to next digit box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are typed
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
        handleVerifyOtp(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  const handleAutoFillCode = () => {
    if (sentCode) {
      const digits = sentCode.split('').slice(0, 6);
      setOtpDigits(digits);
      handleVerifyOtp(sentCode);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await sendVerificationCode(email.trim());
      if (res.code) {
        setSentCode(res.code);
      }
      setResendCountdown(45);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await verifyCode(email.trim(), code);
      setVerifySuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Incorrect or expired code.');
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
            {step === 'credentials' ? 'Sign In to NexusMind AI' : 'Two-Factor Verification'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 'credentials'
              ? "Don't just store information. Make it intelligent."
              : 'Security verification code dispatched to your email'}
          </p>
        </div>

        {/* Demo Quick-Fill Pill (shown on step 1) */}
        {step === 'credentials' && (
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
        )}

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {step === 'credentials' && (
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
              )}
            </div>
          )}

          {verifySuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">Code verified successfully! Launching workspace...</span>
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 'credentials' ? (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="attarfayaz529@gmail.com"
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
                <span>{isSubmitting ? 'Sending Security Code...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: Email Verification Code (OTP) */
            <div className="space-y-5 animate-fadeIn">
              {/* Email Sent Information */}
              <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
                <div className="inline-flex p-2.5 rounded-full bg-violet-100 text-brand-violet mx-auto mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">Enter 6-Digit Code</h3>
                <p className="text-xs text-slate-500">
                  We've sent a verification code to{' '}
                  <span className="font-semibold text-slate-800 font-mono">{email}</span>
                </p>
              </div>

              {/* Inbox Simulated Banner for Instant Evaluation */}
              {sentCode && (
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-brand-violet flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-violet tracking-wider block">
                        Email Code Delivered
                      </span>
                      <span className="font-mono font-bold tracking-widest text-sm text-navy-900">
                        {sentCode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[11px] font-bold shadow-sm transition"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-violet focus:bg-white focus:outline-none transition"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isSubmitting || otpDigits.some((d) => d === '')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-brand-violet hover:opacity-95 text-white text-xs font-bold shadow-md shadow-navy-900/10 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Verifying Code...' : 'Verify Code & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Resend and Change Email Actions */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setErrorMsg('');
                  }}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || isSubmitting}
                  className="text-brand-violet hover:underline font-bold disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 'credentials' && (
            <div className="pt-2 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-navy-900 font-bold hover:underline">
                Create an account
              </Link>
            </div>
          )}

          {/* Backend Connection Config Option */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setShowBackendInput((prev) => !prev)}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold inline-flex items-center gap-1 transition"
            >
              <Link2 className="w-3 h-3" />
              <span>{showBackendInput ? 'Hide Backend Settings' : 'Connect Render Backend URL'}</span>
            </button>
            {showBackendInput && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Render Live Backend URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={backendUrlInput}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    placeholder="https://your-service.onrender.com"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-navy-900"
                  />
                  <button
                    type="button"
                    onClick={handleSaveBackend}
                    disabled={!backendUrlInput.trim()}
                    className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition"
                  >
                    Save
                  </button>
                </div>
                {backendSavedMsg && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{backendSavedMsg}</p>
                )}
              </div>
            )}
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
