import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService.js';
import { feedbackService, getFileUrl } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { SLAIndicator } from '../../components/tickets/SLAIndicator.jsx';
import { LoadingSpinner } from '../../components/common/EmptyState.jsx';
import { FeedbackForm } from '../../components/feedback/FeedbackForm.jsx';
import {
  ArrowLeft,
  Paperclip,
  Send,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  History,
  MessageSquare,
  Shield,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { ROLE_BADGES } from '../../utils/constants.js';

export const EmployeeTicketDetail = () => {
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
  const [commentFiles, setCommentFiles] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reopen Modal State
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
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
          // No feedback yet
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

  const handleConfirmClose = async () => {
    if (!window.confirm('Are you sure you want to confirm resolution and close this ticket?')) return;
    setActionLoading(true);
    try {
      const updated = await ticketService.updateStatus(ticket._id, 'CLOSED', 'Confirmed by Employee');
      setTicket(updated);
      loadTicketData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please provide a reason for reopening the ticket.');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await ticketService.updateStatus(ticket._id, 'REOPENED', reopenReason.trim());
      setTicket(updated);
      setReopenModalOpen(false);
      setReopenReason('');
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
    commentFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      await ticketService.addComment(ticket._id, formData);
      setCommentText('');
      setCommentFiles([]);
      loadTicketData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading ticket details & conversation..." />;

  if (error || !ticket) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center max-w-lg mx-auto shadow-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
        <h3 className="font-bold text-sm text-rose-900">Access Denied or Not Found</h3>
        <p className="text-xs mt-1 text-rose-600">{error || 'Ticket could not be loaded.'}</p>
        <Link to="/employee/tickets" className="inline-block mt-4 text-xs font-bold underline text-brand-700 hover:text-brand-800">
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/employee/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Tickets</span>
        </Link>
        <div className="flex items-center gap-2">
          <SLAIndicator sla={ticket.sla} status={ticket.status} />
        </div>
      </div>

      {/* Main Ticket Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
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

        {/* Agent Info */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Assigned Support Agent:{' '}
            <strong className="text-slate-800">
              {ticket.assignedTo ? ticket.assignedTo.name : 'Awaiting Assignment'}
            </strong>
          </div>
          {ticket.reopenedCount > 0 && (
            <span className="text-amber-600 font-medium">Reopened {ticket.reopenedCount} time(s)</span>
          )}
        </div>
      </div>

      {/* RESOLVED ACTION BANNER */}
      {ticket.status === 'RESOLVED' && (
        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Support Marked this Ticket as Resolved
            </h3>
            <p className="text-xs text-teal-700 mt-1">
              Please verify if the solution works. Confirm closure to submit feedback, or reopen if you still need assistance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setReopenModalOpen(true)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reopen
            </button>
            <button
              onClick={handleConfirmClose}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Confirm & Close
            </button>
          </div>
        </div>
      )}

      {/* PENDING NOTIFICATION BANNER */}
      {ticket.status === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-purple-600 shrink-0" />
          <div>
            <strong className="text-purple-900">Additional Information Requested:</strong> Support is waiting for your reply. Adding a comment below will automatically resume the ticket into <strong className="text-purple-800">IN_PROGRESS</strong>.
          </div>
        </div>
      )}

      {/* CLOSED FEEDBACK SECTION */}
      {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') && (
        <FeedbackForm
          ticketId={ticket._id}
          existingFeedback={feedback}
          onFeedbackSubmitted={(fb) => setFeedback(fb)}
        />
      )}

      {/* REOPEN MODAL */}
      {reopenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Reopen Ticket
            </h3>
            <p className="text-xs text-slate-500">
              Please explain why the issue is still unresolved so the assigned agent can address it promptly.
            </p>
            <textarea
              required
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The fix resolved the error on desktop but mobile VPN is still timing out..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReopenModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReopen}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {actionLoading ? 'Reopening...' : 'Reopen Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS & CONVERSATION SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          Conversation & Updates ({comments.length})
        </h3>

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No comments posted yet.</p>
          ) : (
            comments.map((c) => {
              const isMe = c.user?._id === user?._id;
              return (
                <div
                  key={c._id}
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isMe
                      ? 'bg-brand-50/70 border-brand-200/80 ml-4 sm:ml-8'
                      : 'bg-slate-50 border-slate-200/80 mr-4 sm:mr-8'
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

        {/* Post New Comment Box */}
        {ticket.status !== 'CLOSED' && (
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-200/80 space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your message to support or provide requested information..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            />

            <div className="flex items-center justify-between">
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

              {commentFiles.length > 0 && (
                <span className="text-[11px] text-slate-500">{commentFiles.length} file(s) attached</span>
              )}

              <button
                type="submit"
                disabled={submittingComment || (!commentText.trim() && commentFiles.length === 0)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? 'Sending...' : 'Send Reply'}</span>
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

export default EmployeeTicketDetail;
