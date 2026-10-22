import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { analyticsService, ticketService } from '../../services/index.js';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Ticket,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Inbox,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashData, ticketsData] = await Promise.all([
          analyticsService.getDashboard(),
          ticketService.getTickets({ limit: 5 }),
        ]);

        setMetrics(dashData.summary || {});
        setRecentTickets(ticketsData.data || []);
      } catch (err) {
        console.error('Failed to load employee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your support dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Premium Vibrant Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/20 border border-indigo-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Glow orb */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold mb-3 backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Employee Self-Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Welcome, {user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-xl font-medium leading-relaxed">
            Report hardware, software, or access issues. Track real-time SLA resolutions and collaborate with dedicated support engineers.
          </p>
        </div>

        <Link
          to="/employee/tickets/new"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-2xl shadow-lg shadow-black/10 hover:scale-[1.02] transition-all self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Raise Support Ticket</span>
        </Link>
      </div>

      {/* Colorful, Eye-Catching Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raised Card (Sky Blue Theme) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-100/90 via-sky-50 to-blue-50 border-2 border-blue-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-900">Total Raised</span>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-950">
            {metrics?.totalRaised || 0}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-200/60 px-2 py-0.5 rounded-full">
              All Time
            </span>
            <span className="text-[11px] text-blue-700/80 font-medium">Lifetime requests</span>
          </div>
        </div>

        {/* Active Tickets (Amber / Orange Theme) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50 border-2 border-amber-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-900">Active / Servicing</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-950">
            {metrics?.activeTotal || 0}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              In Progress
            </span>
            <span className="text-[11px] text-amber-700/80 font-medium">Under active review</span>
          </div>
        </div>

        {/* Action Required (Purple / Violet Theme) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-100/90 via-violet-50 to-purple-50 border-2 border-purple-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-900">Action Required</span>
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/25">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-950">
            {metrics?.pendingCount || 0}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded-full">
              Awaiting Info
            </span>
            <span className="text-[11px] text-purple-700/80 font-medium">Pending your reply</span>
          </div>
        </div>

        {/* Resolved (Emerald / Mint Theme) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-100/90 via-teal-50 to-emerald-50 border-2 border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-900">Resolved & Closed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950">
            {(metrics?.resolvedCount || 0) + (metrics?.closedCount || 0)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
              Completed
            </span>
            <span className="text-[11px] text-emerald-700/80 font-medium">Successfully solved</span>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#F4F8FD] border-2 border-[#CBDCF0] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBDCF0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-950">
                Recent Support Requests
              </h3>
              <p className="text-[11px] text-slate-600 font-medium">Monitor active ticket statuses and SLA countdown deadlines</p>
            </div>
          </div>
          <Link
            to="/employee/tickets"
            className="text-xs text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1.5 self-start sm:self-auto bg-blue-100/70 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
          >
            <span>View All My Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#E8F1FA] border-2 border-dashed border-[#BACFE8]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">No support tickets raised yet</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-6 font-medium">
              Have a problem with hardware, software, VPN, or network? Submit a new ticket to get dedicated engineering support.
            </p>
            <Link
              to="/employee/tickets/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 hover:scale-[1.02] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Your First Ticket</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-blue-200/60">
            {recentTickets.map((t) => (
              <Link
                key={t._id}
                to={`/employee/tickets/${t._id}`}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-100/50 p-3 rounded-2xl transition-colors group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-brand-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                      {t.ticketId}
                    </span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs font-semibold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                      {t.category?.name}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                    {t.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <SLAIndicator sla={t.sla} status={t.status} />
                  <span className="text-xs font-bold text-brand-700 group-hover:translate-x-1 transition-transform flex items-center">
                    <ArrowRight className="w-4 h-4" />
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

export default EmployeeDashboard;
