import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants.js';

export const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const colorClass = PRIORITY_COLORS[priority] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${colorClass}`}>
      {priority}
    </span>
  );
};
