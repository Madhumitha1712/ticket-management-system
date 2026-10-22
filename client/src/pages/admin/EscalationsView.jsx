import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slaService } from '../../services/index.js';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState.jsx';
import { AlertOctagon, ArrowRight, ShieldAlert, Clock, User, CheckCircle } from 'lucide-react';

export const EscalationsView = () => {
  const [escalatedTickets, setEscalatedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEscalations = async () => {
    setLoading(true);
    try {
      const res = await slaService.getEscalations();
      setEscalatedTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load escalations queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscalations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            SLA Escalations & Breached Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active tickets requiring immediate executive intervention due to SLA deadline violations
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Scanning escalation queue..." />
      ) : escalatedTickets.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Zero active SLA breaches!"
          description="All active support tickets are currently within their SLA response & resolution deadlines."
        />
      ) : (
        <div className="space-y-3">
          {escalatedTickets.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-2xl border border-red-200/90 bg-red-50/50 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-700 bg-red-100/80 border border-red-200 px-2 py-0.5 rounded">
                    {t.ticketId}
                  </span>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <span className="text-xs text-slate-600">
                    Category: <strong className="text-slate-800">{t.category?.name}</strong>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 animate-pulse">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  SLA Breached & Escalated
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{t.description}</p>
              </div>

              {t.escalation?.reason && (
                <div className="p-2.5 rounded-xl bg-white border border-red-200 text-xs text-red-800 shadow-xs">
                  <strong>Escalation Reason:</strong> {t.escalation.reason} (Escalated at:{' '}
                  {new Date(t.escalation.escalatedAt || t.updatedAt).toLocaleString()})
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-red-100 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-4">
                  <span>
                    Requester: <strong className="text-slate-700">{t.createdBy?.name}</strong> ({t.createdBy?.department})
                  </span>
                  <span>
                    Assigned Agent:{' '}
                    <strong className="text-slate-700">
                      {t.assignedTo ? t.assignedTo.name : 'Unassigned'}
                    </strong>
                  </span>
                </div>
                <Link
                  to={`/admin/tickets/${t._id}`}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1"
                >
                  <span>Intervene / Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EscalationsView;
