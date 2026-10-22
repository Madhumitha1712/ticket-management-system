import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const SLAIndicator = ({ sla, status }) => {
  if (!sla) return null;

  const isClosedOrResolved = status === 'RESOLVED' || status === 'CLOSED';
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (isClosedOrResolved || !sla.resolutionDeadline) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(sla.resolutionDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('SLA Deadline Expired');
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0 && minutes < 30) {
        setIsUrgent(true);
      }

      setTimeLeft(`${hours}h ${minutes}m remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [sla.resolutionDeadline, isClosedOrResolved]);

  if (sla.isBreached || sla.resolutionStatus === 'BREACHED') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
        <AlertOctagon className="w-3.5 h-3.5 animate-pulse text-rose-600" />
        <span>SLA Breached</span>
      </div>
    );
  }

  if (isClosedOrResolved) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        <span>SLA Completed ({sla.resolutionStatus})</span>
      </div>
    );
  }

  if (sla.warningTriggered || isUrgent) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>SLA At Risk: {timeLeft}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
      <Clock className="w-3.5 h-3.5 text-brand-600" />
      <span>{timeLeft || 'Tracking SLA'}</span>
    </div>
  );
};

export default SLAIndicator;
