import React from 'react';
import { CheckResult, SeverityLevel } from '../../types';

interface StatusBadgeProps {
  status: string;
  type?: 'result' | 'severity' | 'verification' | 'action';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'result' }) => {
  const normalized = status.toUpperCase();

  // PASS / WARNING / FAIL
  if (normalized === 'PASS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        PASS
      </span>
    );
  }

  if (normalized === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        WARNING
      </span>
    );
  }

  if (normalized === 'FAIL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
        FAIL
      </span>
    );
  }

  // Severities: LOW, MEDIUM, HIGH, CRITICAL
  if (type === 'severity') {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      LOW: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
      MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };
    const s = map[normalized] || map.LOW;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
        {normalized}
      </span>
    );
  }

  // Verification & Document Statuses
  if (normalized === 'VERIFIED' || normalized === 'VALID' || normalized === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    );
  }

  if (normalized === 'PENDING' || normalized === 'IN PROGRESS' || normalized === 'NEEDS REVIEW') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        {status}
      </span>
    );
  }

  if (normalized === 'EXPIRED' || normalized === 'MISSING' || normalized === 'FLAGGED' || normalized === 'PENDING MANIFEST') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};
