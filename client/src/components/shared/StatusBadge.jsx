import React from 'react';

export function StatusBadge({ status, type = 'order' }) {
  const s = (status || '').toLowerCase();

  const orderStyles = {
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    processing: 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse',
    'on-hold': 'bg-amber-50 text-amber-800 border-amber-200',
    pending: 'bg-orange-50 text-orange-800 border-orange-200',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
    refunded: 'bg-purple-50 text-purple-800 border-purple-200',
    failed: 'bg-red-50 text-red-800 border-red-200',
  };

  const taskStyles = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    overdue: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const styleMap = type === 'task' ? taskStyles : orderStyles;
  const badgeClass = styleMap[s] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${badgeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
}
