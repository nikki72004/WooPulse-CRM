import React from 'react';
import { Crown, Sparkles, AlertTriangle, UserCheck, Clock } from 'lucide-react';

export function SegmentBadge({ segment, size = 'md' }) {
  const seg = segment || 'Active';
  
  const styles = {
    Loyal: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/80 shadow-sm',
      icon: Crown,
      iconColor: 'text-amber-600',
      label: 'VIP / Loyal',
    },
    Active: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      icon: UserCheck,
      iconColor: 'text-emerald-600',
      label: 'Active',
    },
    New: {
      bg: 'bg-blue-50 text-blue-900 border-blue-200/80',
      icon: Sparkles,
      iconColor: 'text-blue-600',
      label: 'New Patron',
    },
    'At Risk': {
      bg: 'bg-orange-50 text-orange-900 border-orange-200/80',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      label: 'At Risk',
    },
    Inactive: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
      iconColor: 'text-slate-500',
      label: 'Inactive',
    },
  };

  const config = styles[seg] || styles.Active;
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${
        config.bg
      } ${isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}
    >
      <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.iconColor}`} />
      <span>{config.label}</span>
    </span>
  );
}
