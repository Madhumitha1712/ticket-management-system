import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService.js';
import { categoryService } from '../../services/index.js';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState.jsx';
import { Search, PlusCircle, Filter, ArrowRight, Clock, MessageSquare, Paperclip } from 'lucide-react';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketData, catData] = await Promise.all([
        ticketService.getTickets({
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          category: categoryFilter || undefined,
          page: pagination.page,
          limit: 10,
        }),
        categoryService.getCategories(),
      ]);

      setTickets(ticketData.data || []);
      setPagination(ticketData.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      setCategories(catData || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, priorityFilter, categoryFilter, pagination.page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Raised Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active requests, reply to support inquiries, and confirm resolutions
          </p>
        </div>
        <Link
          to="/employee/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Raise New Ticket
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID (e.g. TKT-1001) or title..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending (Action Required)</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner text="Fetching your support tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="You currently have no support requests matching your search or filters."
          action={
            <Link
              to="/employee/tickets/new"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Raise a Ticket
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t._id}
              to={`/employee/tickets/${t._id}`}
              className="block glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-lg">
                    {t.ticketId}
                  </span>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <span className="text-xs text-slate-500">
                    Category: <strong className="text-slate-800">{t.category?.name || 'General'}</strong>
                  </span>
                </div>
                <SLAIndicator sla={t.sla} status={t.status} />
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1.5">
                {t.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                {t.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span>
                    Raised: {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {t.assignedTo && (
                    <span className="text-slate-500">
                      Assigned Agent: <strong className="text-slate-700">{t.assignedTo.name}</strong>
                    </span>
                  )}
                  {t.attachments?.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Paperclip className="w-3 h-3" />
                      {t.attachments.length} attachment(s)
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-brand-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
