import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService.js';
import { userService, categoryService } from '../../services/index.js';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState.jsx';
import {
  Search,
  UserCheck,
  ArrowRight,
  Filter,
  User,
  Paperclip,
  Flame,
  Shield,
  X,
  Check,
} from 'lucide-react';
import { TICKET_PRIORITY, TICKET_STATUS } from '../../utils/constants.js';

export const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Assignment Modal State
  const [assignModal, setAssignModal] = useState({ open: false, ticket: null, selectedAgent: '' });
  // Priority Modal State
  const [priorityModal, setPriorityModal] = useState({ open: false, ticket: null, selectedPriority: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketData, agentsData, categoriesData] = await Promise.all([
        ticketService.getTickets({
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          category: categoryFilter || undefined,
          assignedTo: agentFilter || undefined,
          page: pagination.page,
          limit: 10,
        }),
        userService.getAgents(),
        categoryService.getCategories(),
      ]);

      setTickets(ticketData.data || []);
      setPagination(ticketData.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      setAgents(agentsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Failed to load tickets data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, priorityFilter, categoryFilter, agentFilter, pagination.page]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModal.selectedAgent) return;
    setActionLoading(true);
    try {
      await ticketService.assignTicket(assignModal.ticket._id, assignModal.selectedAgent);
      setAssignModal({ open: false, ticket: null, selectedAgent: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    if (!priorityModal.selectedPriority) return;
    setActionLoading(true);
    try {
      await ticketService.updatePriority(priorityModal.ticket._id, priorityModal.selectedPriority);
      setPriorityModal({ open: false, ticket: null, selectedPriority: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">System-Wide Tickets Roster</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View, assign, reassign, adjust priority levels, and inspect full organizational support tickets
        </p>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Ticket ID (e.g. TKT-1001) or title..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Assigned Agent */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">⚠️ Unassigned Tickets</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.activeTicketCount || 0} active)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner text="Fetching system tickets roster..." />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets found" description="No support tickets match the selected filters." />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                    {t.ticketId}
                  </span>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <span className="text-xs text-slate-500">
                    Category: <strong className="text-slate-700">{t.category?.name}</strong>
                  </span>
                </div>
                <SLAIndicator sla={t.sla} status={t.status} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{t.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-4">
                  <span>
                    Raised by: <strong className="text-slate-700">{t.createdBy?.name}</strong> ({t.createdBy?.department})
                  </span>
                  <span>
                    Assigned: <strong className="text-brand-700">{t.assignedTo ? t.assignedTo.name : 'Unassigned'}</strong>
                  </span>
                  <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Admin Quick Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAssignModal({
                        open: true,
                        ticket: t,
                        selectedAgent: t.assignedTo?._id || '',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-brand-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {t.assignedTo ? 'Reassign' : 'Assign'}
                  </button>

                  <button
                    onClick={() =>
                      setPriorityModal({
                        open: true,
                        ticket: t,
                        selectedPriority: t.priority,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Priority
                  </button>

                  <Link
                    to={`/admin/tickets/${t._id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGNMENT MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Assign Ticket {assignModal.ticket?.ticketId}
            </h3>
            <p className="text-xs text-slate-500">
              Select an active support engineer. The agent will be notified and ticket status will shift to <strong className="text-brand-600">ASSIGNED</strong>.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Support Agent
                </label>
                <select
                  required
                  value={assignModal.selectedAgent}
                  onChange={(e) => setAssignModal({ ...assignModal, selectedAgent: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-medium shadow-xs"
                >
                  <option value="">-- Choose an active Agent --</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} — {a.department} ({a.activeTicketCount || 0} active tickets)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal({ open: false, ticket: null, selectedAgent: '' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !assignModal.selectedAgent}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIORITY MODAL */}
      {priorityModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Update Priority: {priorityModal.ticket?.ticketId}
            </h3>
            <p className="text-xs text-slate-500">
              Modifying ticket priority will automatically recalculate SLA response and resolution deadlines.
            </p>

            <form onSubmit={handlePrioritySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Priority Level
                </label>
                <select
                  required
                  value={priorityModal.selectedPriority}
                  onChange={(e) => setPriorityModal({ ...priorityModal, selectedPriority: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-medium shadow-xs"
                >
                  <option value="CRITICAL">🔥 CRITICAL (15m Response / 2h Resolution)</option>
                  <option value="HIGH">⚡ HIGH (30m Response / 4h Resolution)</option>
                  <option value="MEDIUM">⚖️ MEDIUM (2h Response / 12h Resolution)</option>
                  <option value="LOW">🌱 LOW (4h Response / 24h Resolution)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriorityModal({ open: false, ticket: null, selectedPriority: '' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {actionLoading ? 'Updating...' : 'Recalculate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTickets;
