import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService.js';
import { feedbackService, getFileUrl } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { LoadingSpinner } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft,
  Paperclip,
  Send,
  CheckCircle,
  Play,
  Clock,
  RotateCcw,
  AlertCircle,
  History,
  MessageSquare,
  Shield,
  User,
  Lock,
  ExternalLink,
  Star,
  Check,
} from 'lucide-react';
import { ROLE_BADGES } from '../../utils/constants.js';

export const AgentTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentFiles, setCommentFiles] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Action Modal State
  const [statusModal, setStatusModal] = useState({ open: false, targetStatus: '', title: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadTicketData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketData, commentsData, historyData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getComments(id),
        ticketService.getHistory(id),
      ]);

      setTicket(ticketData);
      setComments(commentsData || []);
      setHistory(historyData || []);

      if (ticketData.status === 'CLOSED' || ticketData.status === 'RESOLVED') {
        try {
          const fb = await feedbackService.getFeedbackByTicket(ticketData._id);
          setFeedback(fb);
        } catch {
          // No feedback
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleStatusTransition = async (targetStatus, reason = '') => {
    setActionLoading(true);
    try {
      const updated = await ticketService.updateStatus(ticket._id, targetStatus, reason);
      setTicket(updated);
      setStatusModal({ open: false, targetStatus: '', title: '', reason: '' });
      loadTicketData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && commentFiles.length === 0) return;

    setSubmittingComment(true);
    const formData = new FormData();
    formData.append('message', commentText.trim());
    formData.append('isInternal', isInternal);
    commentFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      await ticketService.addComment(ticket._id, formData);
      setCommentText('');
      setIsInternal(false);
      setCommentFiles([]);
      loadTicketData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading ticket details & queue status..." />;

  if (error || !ticket) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center max-w-lg mx-auto shadow-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
        <h3 className="font-bold text-sm text-rose-900">Access Denied or Not Assigned</h3>
        <p className="text-xs mt-1 text-rose-600">{error || 'You are not authorized to view this ticket.'}</p>
        <Link to="/agent/tickets" className="inline-block mt-4 text-xs font-bold underline text-brand-700 hover:text-brand-800">
          Back to Assigned Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Queue</span>
        </Link>
        <div className="flex items-center gap-2">
          <SLAIndicator sla={ticket.sla} status={ticket.status} />
        </div>
      </div>

      {/* Main Ticket & Requester Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-1 rounded-lg">
              {ticket.ticketId}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="text-xs text-slate-500">
              Category: <strong className="text-slate-800">{ticket.category?.name}</strong>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Requester Information */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 border border-brand-200/60 flex items-center justify-center font-bold">
              {ticket.createdBy?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-900">{ticket.createdBy?.name}</p>
              <p className="text-slate-500 text-[11px]">{ticket.createdBy?.email} • {ticket.createdBy?.department}</p>
            </div>
          </div>
          {ticket.createdBy?.phone && (
            <span className="text-slate-500 text-xs">Phone: {ticket.createdBy.phone}</span>
          )}
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">{ticket.title}</h1>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {ticket.description}
          </p>
        </div>

        {/* Attachments */}
        {ticket.attachments?.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              Attached Files ({ticket.attachments.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={getFileUrl(att.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-brand-700 hover:text-brand-800 transition-colors shadow-xs"
                >
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  <span className="truncate max-w-[200px]">{att.fileName}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AGENT WORKFLOW ACTION BAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
            Workflow Actions
          </span>
          <span className="font-bold text-slate-800">
            Current Status: <span className="text-brand-700">{ticket.status}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status: ASSIGNED -> Accept Ticket */}
          {ticket.status === 'ASSIGNED' && (
            <button
              onClick={() => handleStatusTransition('IN_PROGRESS', 'Accepted by Support Agent')}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Accept Ticket & Start Work
            </button>
          )}

          {/* Status: IN_PROGRESS / REOPENED -> Request Info or Resolve */}
          {(ticket.status === 'IN_PROGRESS' || ticket.status === 'REOPENED') && (
            <>
              <button
                onClick={() =>
                  setStatusModal({
                    open: true,
                    targetStatus: 'PENDING',
                    title: 'Request Information from Employee (Set Pending)',
                    reason: '',
                  })
                }
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                Request Information (Pending)
              </button>
              <button
                onClick={() =>
                  setStatusModal({
                    open: true,
                    targetStatus: 'RESOLVED',
                    title: 'Mark Ticket as Resolved',
                    reason: '',
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Resolve Ticket
              </button>
            </>
          )}

          {/* Status: PENDING -> Resume Work or Resolve */}
          {ticket.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleStatusTransition('IN_PROGRESS', 'Resumed by Support Agent')}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-amber-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                Resume (In Progress)
              </button>
              <button
                onClick={() =>
                  setStatusModal({
                    open: true,
                    targetStatus: 'RESOLVED',
                    title: 'Mark Ticket as Resolved',
                    reason: '',
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Resolve Ticket
              </button>
            </>
          )}

          {ticket.status === 'RESOLVED' && (
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Awaiting Employee Closure Confirmation
            </span>
          )}

          {ticket.status === 'CLOSED' && (
            <span className="text-xs text-slate-500 font-semibold">Ticket Closed & Completed</span>
          )}
        </div>
      </div>

      {/* FEEDBACK DISPLAY (If Closed) */}
      {feedback && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Employee Satisfaction Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {feedback.comment && (
            <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
              "{feedback.comment}"
            </p>
          )}
        </div>
      )}

      {/* STATUS ACTION REASON MODAL */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {statusModal.targetStatus === 'RESOLVED' ? (
                <CheckCircle className="w-4 h-4 text-teal-600" />
              ) : (
                <Clock className="w-4 h-4 text-purple-600" />
              )}
              {statusModal.title}
            </h3>
            <p className="text-xs text-slate-500">
              {statusModal.targetStatus === 'RESOLVED'
                ? 'Provide summary notes describing the resolution provided to the employee:'
                : 'State what additional information is required from the employee:'}
            </p>
            <textarea
              required
              rows={3}
              value={statusModal.reason}
              onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
              placeholder="Enter resolution details or inquiry notes..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, targetStatus: '', title: '', reason: '' })}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusTransition(statusModal.targetStatus, statusModal.reason)}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer ${
                  statusModal.targetStatus === 'RESOLVED'
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERSATION & INTERNAL NOTES STREAM */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          Support Thread & Internal Notes ({comments.length})
        </h3>

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No comments or notes yet.</p>
          ) : (
            comments.map((c) => {
              const isInternalNote = c.isInternal;
              const isMe = c.user?._id === user?._id;
              return (
                <div
                  key={c._id}
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isInternalNote
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/40 text-slate-800'
                      : isMe
                      ? 'bg-brand-50/70 border-brand-200/80 ml-4 sm:ml-8 text-slate-800'
                      : 'bg-slate-50 border-slate-200/80 mr-4 sm:mr-8 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {c.user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-semibold text-slate-800">{c.user?.name}</span>
                      <span className={`px-2 py-0.2 text-[9px] font-bold uppercase rounded border ${ROLE_BADGES[c.user?.role] || ''}`}>
                        {c.user?.role}
                      </span>
                      {isInternalNote && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                          <Lock className="w-3 h-3" /> Staff Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(c.createdAt).toLocaleDateString()})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 whitespace-pre-wrap pl-8">{c.message}</p>

                  {c.attachments?.length > 0 && (
                    <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                      {c.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={getFileUrl(att.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] text-brand-700 shadow-xs hover:border-brand-300"
                        >
                          <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                          <span>{att.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'CLOSED' && (
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-200/80 space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isInternal
                  ? 'Write an internal staff note (visible only to Agents & Admins)...'
                  : 'Write a public reply to the employee...'
              }
              className={`w-full border rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-xs ${
                isInternal
                  ? 'bg-amber-50/50 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
              }`}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-700 text-xs cursor-pointer transition-colors shadow-xs">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setCommentFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>

                {/* Internal Note Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span className={`flex items-center gap-1 ${isInternal ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                    <Lock className="w-3.5 h-3.5" /> Internal Note (Staff Only)
                  </span>
                </label>
              </div>

              {commentFiles.length > 0 && (
                <span className="text-[11px] text-slate-500">{commentFiles.length} file(s)</span>
              )}

              <button
                type="submit"
                disabled={submittingComment || (!commentText.trim() && commentFiles.length === 0)}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  isInternal
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? 'Sending...' : isInternal ? 'Save Internal Note' : 'Send Public Reply'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ACTIVITY & AUDIT HISTORY ACCORDION */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          Audit Trail & Activity History ({history.length})
        </h3>
        <div className="space-y-2 pt-2">
          {history.map((h) => (
            <div
              key={h._id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
            >
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {h.performedBy?.name || 'System'}{' '}
                    <span className="text-[10px] text-slate-500">({h.performedBy?.role || 'SYSTEM'})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">{h.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentTicketDetail;
