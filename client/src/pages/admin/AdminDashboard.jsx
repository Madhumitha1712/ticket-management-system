import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, slaService } from '../../services/index.js';
import { LoadingSpinner } from '../../components/common/EmptyState.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Ticket,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Star,
  Activity,
} from 'lucide-react';

const STATUS_CHART_COLORS = {
  OPEN: '#10b981',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  PENDING: '#a855f7',
  RESOLVED: '#14b8a6',
  CLOSED: '#64748b',
  REOPENED: '#f43f5e',
};

const PRIORITY_CHART_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
};

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggeringCheck, setTriggeringCheck] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleInstantSlaCheck = async () => {
    setTriggeringCheck(true);
    setScanMessage('');
    try {
      const res = await slaService.triggerCheck();
      setScanMessage(`Scan complete: ${res.inspected} checked, ${res.warned} warned, ${res.breached} escalated.`);
      loadDashboard();
    } catch (err) {
      setScanMessage(err.message || 'SLA scan failed.');
    } finally {
      setTriggeringCheck(false);
    }
  };

  if (loading) return <LoadingSpinner text="Computing enterprise real-time metrics & charts..." />;

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-Time SLA Monitor Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">System Operations Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time aggregate ticket metrics, SLA compliance analytics, and support workload distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstantSlaCheck}
            disabled={triggeringCheck}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Scan all active tickets against response and resolution SLA deadlines"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${triggeringCheck ? 'animate-spin' : ''}`} />
            <span>{triggeringCheck ? 'Scanning SLA...' : 'Run SLA Check'}</span>
          </button>
          <Link
            to="/admin/escalations"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-red-500/20 flex items-center gap-1.5 transition-all"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Escalations ({summary.escalatedTickets || 0})</span>
          </Link>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-brand-800 text-xs flex items-center gap-2 animate-fadeIn">
          <Activity className="w-4 h-4 shrink-0 text-brand-600" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tickets */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Total Tickets</span>
            <Ticket className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary.totalTickets || 0}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">All time records</p>
        </div>

        {/* In Progress */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold">In Progress</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{summary.inProgressTickets || 0}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active servicing</p>
        </div>

        {/* SLA Breached */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-semibold">SLA Breaches</span>
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">{summary.breachedTickets || 0}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Deadline exceeded</p>
        </div>

        {/* SLA Compliance Rate */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold">SLA Target %</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{summary.slaComplianceRate || 100}%</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Met target SLA</p>
        </div>

        {/* Avg Resolution Time */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Avg Turnaround</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{summary.avgResolutionHours || 0}h</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Hours to resolution</p>
        </div>

        {/* Satisfaction Rating */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Satisfaction</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary.avgRating || 5.0} / 5</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Employee reviews</p>
        </div>
      </div>

      {/* Interactive Recharts Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Tickets by Status (Pie Chart) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-600" />
            Tickets by Status
          </h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ticketsByStatus || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(charts.ticketsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_CHART_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tickets by Priority (Bar Chart) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Tickets by Priority
          </h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ticketsByPriority || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(charts.ticketsByPriority || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={PRIORITY_CHART_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Tickets by Category (Horizontal Bar Chart) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-indigo-600" />
            Tickets by Category
          </h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts.ticketsByCategory || []}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Admin Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/tickets"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
              Manage All Tickets
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Assign, reassign & modify priorities</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/users"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
              User & Agent Directory
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{summary.totalUsers || 0} active users, {summary.totalAgents || 0} agents</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/sla"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
              SLA Rules Engine
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure response & resolution targets</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/leaderboard"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
              Agent Leaderboard
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Track resolution rates & review scores</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
