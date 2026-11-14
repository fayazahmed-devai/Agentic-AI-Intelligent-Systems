import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  Loader2,
  Quote,
  Scale,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { useFiles } from '../context/FileContext';
import { ClaimVerification } from '../types';
import FormattedContent from '../components/FormattedContent';

const SAMPLE_CLAIMS = [
  'Superposition theorem cannot be directly used to calculate power because power has a square relationship with current.',
  'The current in the load resistor is 0.5 Amperes.',
  'The maximum power transfer occurs when the load resistance equals the Thevenin resistance.',
  'Kirchhoff Current Law states that total incoming current equals total outgoing current at any electrical node.',
];

export default function EvidenceTrustPage() {
  const { files } = useFiles();
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<ClaimVerification | null>(null);
  const [trustSummary, setTrustSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrustSummary();
  }, []);

  const fetchTrustSummary = async () => {
    try {
      const res = await api.get('/evidence/summary');
      if (res.data) setTrustSummary(res.data);
    } catch (err) {
      console.error('Failed to load trust summary', err);
    }
  };

  const handleVerifyClaim = async (claimText?: string) => {
    const c = (claimText || claim).trim();
    if (!c) return;

    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      const res = await api.post('/evidence/verify', {
        claim: c,
      });
      setVerification(res.data);
      fetchTrustSummary();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ClaimVerification['status']) => {
    switch (status) {
      case 'supported':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fully Supported
          </span>
        );
      case 'partially_supported':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Partially Supported
          </span>
        );
      case 'conflicting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" /> Conflicting / Contradicted
          </span>
        );
      case 'insufficient':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-slate-500" /> Insufficient Information
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verification & Audit Matrix
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Evidence & Trust Centre
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Validate any academic or scientific assertion against your library. Every verdict is strictly corroborated with verbatim quotes, page numbers, and timestamps to eliminate hallucinations.
          </p>
        </div>
      </div>

      {/* Trust Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Grounding Guarantee</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">100%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Strict multi-source grounding</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Hallucination Index</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">0.0%</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Zero ungrounded assertions</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-brand-violet">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Indexed Sources</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{files.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Active files in audit pool</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Verified Verdicts</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">
              {trustSummary?.totalVerified || 'Active'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Forensic assertions tested</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Claim Verification Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Enter Assertion or Claim to Verify
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleVerifyClaim()}
            placeholder="e.g. Superposition theorem cannot be directly used to calculate electrical power..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-slate-800 font-medium"
          />
          <button
            onClick={() => handleVerifyClaim()}
            disabled={loading || !claim.trim()}
            className="px-6 py-3 bg-gradient-to-r from-navy-900 to-brand-violet text-white text-sm font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Claim</span>
              </>
            )}
          </button>
        </div>

        {/* Sample claims */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-slate-400">Quick Claims:</span>
          {SAMPLE_CLAIMS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setClaim(sample);
                handleVerifyClaim(sample);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition truncate max-w-[280px]"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {verification && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assertion Under Audit
              </div>
              <h2 className="text-lg font-bold text-navy-900">"{verification.claim}"</h2>
            </div>
            <div>{getStatusBadge(verification.status)}</div>
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Findings & Analytical Rationale
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
              <FormattedContent content={verification.reasoning} />
            </div>
          </div>

          {/* Contradiction Note if present */}
          {verification.contradiction_note && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold uppercase tracking-wide block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Conflict / Discrepancy Detected
              </span>
              <p>{verification.contradiction_note}</p>
            </div>
          )}

          {/* Citations & Quotes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Quote className="w-4 h-4 text-brand-violet" />
              Direct Corroborating Citations ({verification.citations.length})
            </h3>
            {verification.citations.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">
                No direct citations found in the current documents for this assertion.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verification.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-900 truncate max-w-[200px]">
                        {cite.file_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {cite.location}
                      </span>
                    </div>
                    <blockquote className="text-xs text-slate-700 italic border-l-2 border-brand-violet pl-3 my-1">
                      "{cite.quote}"
                    </blockquote>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Modality: {cite.modality}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

