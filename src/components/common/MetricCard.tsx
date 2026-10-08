import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  highlight?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  highlight = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-metric-card p-5 group ${
        highlight ? 'ring-1 ring-teal-400/40 border-teal-400/30' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2 relative z-10">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        {icon && (
          <div className="text-slate-400 p-1.5 rounded-lg bg-white/5 border border-white/5 shrink-0 group-hover:text-teal-300 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 relative z-10">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10 text-xs text-slate-400 relative z-10">
        <span className="truncate text-[11px]">{subtext || 'Verified in internal ledger'}</span>
        {trend && (
          <span
            className={`font-mono text-[11px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
              trend.positive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
