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
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/20 border border-indigo-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold mb-3 backdrop-blur-md border border-white/20">
            <UserCheck className="w-3.5 h-3.5 text-cyan-200" />
            <span>Support Specialist Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>Support Desk: {user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-xl font-medium">
            Triage assignments, maintain SLA response targets, add diagnostics, and resolve tickets.
          </p>
        </div>
        <Link
          to="/agent/tickets"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-2xl shadow-lg shadow-black/10 transition-all self-start sm:self-auto shrink-0"
        >
          <Ticket className="w-4 h-4 text-indigo-600" />
          <span>View Assigned Queue</span>
        </Link>
      </div>

      {/* Colorful Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Queue (Blue Theme) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-100/90 via-sky-50 to-blue-50 border-2 border-blue-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-900">Active Queue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950">
            {metrics?.activeQueue || 0}
          </div>
          <p className="text-[10px] text-blue-700/80 font-bold mt-1">Pending resolution</p>
        </div>

        {/* SLA Warnings / At-Risk (Amber Theme) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50 border-2 border-amber-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">SLA At-Risk</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {metrics?.slaWarning || 0}
          </div>
          <p className="text-[10px] text-amber-700/80 font-bold mt-1">Near 80% deadline</p>
        </div>

        {/* SLA Breached (Rose Theme) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-100/90 via-red-50 to-rose-50 border-2 border-rose-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-900">SLA Breached</span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-950">
            {metrics?.slaBreached || 0}
          </div>
          <p className="text-[10px] text-rose-700/80 font-bold mt-1">Past SLA deadline</p>
        </div>

        {/* Total Resolved (Emerald Theme) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-100/90 via-teal-50 to-emerald-50 border-2 border-emerald-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">
            {(metrics?.resolved || 0) + (metrics?.closed || 0)}
          </div>
          <p className="text-[10px] text-emerald-700/80 font-bold mt-1">Completed tickets</p>
        </div>

        {/* Customer Rating (Violet / Gold Theme) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-100/90 via-indigo-50 to-purple-50 border-2 border-purple-200/90 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-900">Satisfaction</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Star className="w-4 h-4 fill-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950 flex items-baseline gap-1">
            <span>{metrics?.avgRating || 5.0}</span>
            <span className="text-xs text-purple-700 font-bold">/ 5.0</span>
          </div>
          <p className="text-[10px] text-purple-700/80 font-bold mt-1">CSAT Star Score</p>
        </div>
      </div>

      {/* Active Assigned Tickets Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#F4F8FD] border-2 border-[#CBDCF0] shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[#CBDCF0] pb-4">
          <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-brand-700" />
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
