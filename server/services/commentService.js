import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  ROLES,
  SLA_STATUS,
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
} from '../config/constants.js';

export const getTicketComments = async (ticketId, user) => {
  const filter = { ticket: ticketId };

  // Employees cannot see internal staff notes
  if (user.role === ROLES.EMPLOYEE) {
    filter.isInternal = false;
  }

  return await Comment.find(filter)
    .populate('user', 'name email role department avatar')
    .sort({ createdAt: 1 });
};

export const addComment = async (
  ticketId,
  { message, isInternal = false, attachments = [] },
  user
) => {
  const isObjectId = typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Employees cannot post internal notes
  const internalFlag = user.role === ROLES.EMPLOYEE ? false : Boolean(isInternal);

  // Format Attachments if any
  const formattedAttachments = attachments.map((att) => ({
    fileName: att.fileName || att.originalname || 'attachment',
    fileUrl: att.fileUrl || `/uploads/${att.filename}`,
    fileType: att.fileType || att.mimetype || 'application/octet-stream',
    fileSize: att.fileSize || att.size || 0,
  }));

  // Create Comment Document
  const comment = await Comment.create({
    ticket: ticket._id,
    user: user._id,
    message: message.trim(),
    isInternal: internalFlag,
    attachments: formattedAttachments,
  });

  // Track First Response SLA metric if commenter is an Agent/Admin
  const now = new Date();
  if (!ticket.sla.firstRespondedAt && (user.role === ROLES.AGENT || user.role === ROLES.ADMIN)) {
    ticket.sla.firstRespondedAt = now;
    if (ticket.sla.responseDeadline && now <= ticket.sla.responseDeadline) {
      ticket.sla.responseStatus = SLA_STATUS.MET;
    } else if (ticket.sla.responseDeadline) {
      ticket.sla.responseStatus = SLA_STATUS.BREACHED;
    }
    await ticket.save();
  }

  // Record Immutable History Audit Log
  await TicketHistory.create({
    ticket: ticket._id,
    performedBy: user._id,
    action: formattedAttachments.length > 0 ? HISTORY_ACTIONS.ATTACHMENT_ADDED : HISTORY_ACTIONS.COMMENT_ADDED,
    previousValue: null,
    newValue: {
      isInternal: internalFlag,
      hasAttachments: formattedAttachments.length > 0,
    },
    details: internalFlag
      ? `Internal note added by ${user.name} (${user.role})`
      : `Comment added by ${user.name} (${user.role})`,
    timestamp: now,
  });

  // Notifications Dispatch
  if (!internalFlag) {
    if (user.role === ROLES.EMPLOYEE && ticket.assignedTo) {
      // Notify Assigned Agent
      await Notification.create({
        recipient: ticket.assignedTo,
        type: NOTIFICATION_TYPES.NEW_COMMENT,
        title: `New Comment on ${ticket.ticketId}`,
        message: `${user.name} commented: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
        ticket: ticket._id,
        isRead: false,
      });
    } else if (user.role === ROLES.AGENT || user.role === ROLES.ADMIN) {
      // Notify Ticket Creator Employee
      if (ticket.createdBy.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: ticket.createdBy,
          type: NOTIFICATION_TYPES.NEW_COMMENT,
          title: `Support Update on ${ticket.ticketId}`,
          message: `${user.name} replied: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
          ticket: ticket._id,
          isRead: false,
        });
      }
    }
  }

  return await Comment.findById(comment._id).populate(
    'user',
    'name email role department avatar'
  );
};
