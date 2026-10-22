import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { analyticsService, ticketService } from '../../services/index.js';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Ticket,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashData, ticketsData] = await Promise.all([
          analyticsService.getDashboard(),
          ticketService.getTickets({ limit: 6 }),
        ]);

        setMetrics(dashData.summary || {});
        setActiveQueue(ticketsData.data || []);
      } catch (err) {
        console.error('Failed to load agent dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading agent support queue & performance..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Support Desk: {user?.name}</span>
            <UserCheck className="w-5 h-5 text-brand-600" />
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Triage new assignments, maintain SLA targets, communicate with employees, and resolve tickets.
          </p>
        </div>
        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Ticket className="w-4 h-4" />
          View Full Assigned Queue
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Queue */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Queue</span>
            <Ticket className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {metrics?.activeQueue || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Pending resolution</p>
        </div>

        {/* SLA Warnings / At-Risk */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold">SLA At-Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {metrics?.slaWarning || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Near 80% threshold</p>
        </div>

        {/* SLA Breached */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold">SLA Breached</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {metrics?.slaBreached || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Past deadline</p>
        </div>

        {/* Total Resolved */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {(metrics?.resolved || 0) + (metrics?.closed || 0)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Completed tickets</p>
        </div>

        {/* Customer Rating */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
            <span>{metrics?.avgRating || 5.0}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Employee feedback score</p>
        </div>
      </div>

      {/* Active Assigned Tickets Table */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-brand-600" />
            Active Assigned Support Queue
          </h3>
          <Link
            to="/agent/tickets"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            Open Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeQueue.length === 0 ? (
          <EmptyState
            title="Assigned queue is clear"
            description="You have zero active tickets waiting for resolution right now."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {activeQueue.map((t) => (
              <Link
                key={t._id}
                to={`/agent/tickets/${t._id}`}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2.5 rounded-xl transition-colors group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded">
                      {t.ticketId}
                    </span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs text-slate-500">
                      Requester: <strong className="text-slate-800">{t.createdBy?.name}</strong> ({t.createdBy?.department})
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                    {t.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <SLAIndicator sla={t.sla} status={t.status} />
                  <span className="text-xs text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center font-semibold">
                    Process <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
