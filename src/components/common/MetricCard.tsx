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
      className={`bg-white rounded-xl border p-5 transition-all ${
        highlight
          ? 'border-teal-300 ring-1 ring-teal-100 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
      } ${onClick ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        {icon && <div className="text-slate-400 shrink-0">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="truncate">{subtext || 'Verified in internal ledger'}</span>
        {trend && (
          <span
            className={`font-mono text-[11px] font-semibold shrink-0 ${
              trend.positive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
