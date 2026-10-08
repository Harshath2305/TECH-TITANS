import React from 'react';

interface ComplianceScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
}

export const ComplianceScoreBadge: React.FC<ComplianceScoreBadgeProps> = ({
  score,
  size = 'md',
  showSubtitle = true,
}) => {
  const getColor = (s: number) => {
    if (s >= 85) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (s >= 70) return { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', bar: 'bg-sky-500' };
    if (s >= 50) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
  };

  const style = getColor(score);

  if (size === 'hero') {
    return (
      <div className={`p-4 rounded-xl border ${style.bg} ${style.border} flex flex-col items-center justify-center text-center`}>
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
          Compliance Score
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold tabular-nums font-mono ${style.text}`}>
            {score}
          </span>
          <span className="text-slate-400 text-lg font-medium">/100</span>
        </div>
        {showSubtitle && (
          <div className="text-[11px] font-medium text-slate-600 mt-1">
            Higher score = better compliance
          </div>
        )}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${Math.min(100, score)}%` }} />
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1 rounded-lg border font-mono font-bold text-lg tabular-nums ${style.bg} ${style.text} ${style.border}`}>
          {score}<span className="text-xs font-normal text-slate-500">/100</span>
        </div>
        {showSubtitle && (
          <span className="text-xs text-slate-500 hidden sm:inline">
            (Higher is better)
          </span>
        )}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-semibold tabular-nums text-xs px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
      {score}<span className="text-[10px] text-slate-500 font-normal">/100</span>
    </span>
  );
};
