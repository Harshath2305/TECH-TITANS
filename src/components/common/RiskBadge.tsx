import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showLabel = true }) => {
  const styles: Record<RiskLevel, { text: string; bg: string; border: string; dot: string }> = {
    LOW: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    MEDIUM: {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    HIGH: {
      text: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
    },
    CRITICAL: {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const current = styles[level] || styles.LOW;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      {showLabel ? `${level} RISK` : level}
    </span>
  );
};
