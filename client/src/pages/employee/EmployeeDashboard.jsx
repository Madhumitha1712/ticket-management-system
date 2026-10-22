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
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Welcome, {user?.name}</span>
            <Sparkles className="w-5 h-5 text-brand-600" />
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Raise requests, track real-time SLA resolutions, and collaborate with IT support engineers.
          </p>
        </div>
        <Link
          to="/employee/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Raise Support Ticket
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Raised */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Raised</span>
            <Ticket className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {metrics?.totalRaised || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lifetime support requests</p>
        </div>

        {/* Active Tickets */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active / In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {metrics?.activeTotal || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Currently being serviced</p>
        </div>

        {/* Action Required */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Action Required</span>
            <AlertCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">
            {metrics?.pendingCount || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Pending your response</p>
        </div>

        {/* Resolved / Closed */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {(metrics?.resolvedCount || 0) + (metrics?.closedCount || 0)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Successfully completed</p>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-brand-600" />
            Recent Support Requests
          </h3>
          <Link
            to="/employee/tickets"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            View All My Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No support tickets raised yet"
            description="Have a problem with hardware, software, or network? Raise a ticket to get assistance."
            action={
              <Link
                to="/employee/tickets/new"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Raise Your First Ticket
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTickets.map((t) => (
              <Link
                key={t._id}
                to={`/employee/tickets/${t._id}`}
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
                      {t.category?.name}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                    {t.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <SLAIndicator sla={t.sla} status={t.status} />
                  <span className="text-xs text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                    <ArrowRight className="w-3.5 h-3.5" />
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
