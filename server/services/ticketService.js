import Ticket from '../models/Ticket.js';
import SLARule from '../models/SLARule.js';
import Category from '../models/Category.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateTicketId } from '../utils/generateTicketId.js';
import {
  ROLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  SLA_STATUS,
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
  DEFAULT_SLA_RULES,
} from '../config/constants.js';

// Strict State Transition Validation Matrix
const ALLOWED_TRANSITIONS = {
  [TICKET_STATUS.OPEN]: [
    { next: TICKET_STATUS.ASSIGNED, roles: [ROLES.ADMIN] },
    { next: TICKET_STATUS.IN_PROGRESS, roles: [ROLES.ADMIN] },
  ],
  [TICKET_STATUS.ASSIGNED]: [
    { next: TICKET_STATUS.IN_PROGRESS, roles: [ROLES.AGENT, ROLES.ADMIN] },
    { next: TICKET_STATUS.ASSIGNED, roles: [ROLES.ADMIN] }, // Reassignment
  ],
  [TICKET_STATUS.IN_PROGRESS]: [
    { next: TICKET_STATUS.PENDING, roles: [ROLES.AGENT, ROLES.ADMIN] },
    { next: TICKET_STATUS.RESOLVED, roles: [ROLES.AGENT, ROLES.ADMIN] },
    { next: TICKET_STATUS.ASSIGNED, roles: [ROLES.ADMIN] },
  ],
  [TICKET_STATUS.PENDING]: [
    { next: TICKET_STATUS.IN_PROGRESS, roles: [ROLES.AGENT, ROLES.EMPLOYEE, ROLES.ADMIN] },
    { next: TICKET_STATUS.RESOLVED, roles: [ROLES.AGENT, ROLES.ADMIN] },
    { next: TICKET_STATUS.ASSIGNED, roles: [ROLES.ADMIN] },
  ],
  [TICKET_STATUS.RESOLVED]: [
    { next: TICKET_STATUS.CLOSED, roles: [ROLES.EMPLOYEE, ROLES.ADMIN] },
    { next: TICKET_STATUS.REOPENED, roles: [ROLES.EMPLOYEE, ROLES.ADMIN] },
  ],
  [TICKET_STATUS.REOPENED]: [
    { next: TICKET_STATUS.IN_PROGRESS, roles: [ROLES.AGENT, ROLES.ADMIN] },
    { next: TICKET_STATUS.ASSIGNED, roles: [ROLES.ADMIN] },
    { next: TICKET_STATUS.RESOLVED, roles: [ROLES.AGENT, ROLES.ADMIN] },
  ],
  [TICKET_STATUS.CLOSED]: [
    // Closed tickets cannot transition further (immutable final state)
  ],
};

export const createTicket = async (
  { title, description, category, priority = TICKET_PRIORITY.MEDIUM, attachments = [] },
  user
) => {
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc || !categoryDoc.isActive) {
    const error = new Error('Selected category is invalid or inactive');
    error.statusCode = 400;
    throw error;
  }

  let slaRule = await SLARule.findOne({ priority });
  if (!slaRule) {
    const defaultRule = DEFAULT_SLA_RULES.find((r) => r.priority === priority) || DEFAULT_SLA_RULES[2];
    slaRule = await SLARule.create(defaultRule);
  }

  const now = new Date();
  const responseDeadline = new Date(now.getTime() + slaRule.responseDeadlineMinutes * 60 * 1000);
  const resolutionDeadline = new Date(now.getTime() + slaRule.resolutionDeadlineMinutes * 60 * 1000);

  const ticketId = await generateTicketId();

  const formattedAttachments = attachments.map((att) => ({
    fileName: att.fileName || att.originalname || 'attachment',
    fileUrl: att.fileUrl || `/uploads/${att.filename}`,
    fileType: att.fileType || att.mimetype || 'application/octet-stream',
    fileSize: att.fileSize || att.size || 0,
    uploadedBy: user._id,
    uploadedAt: new Date(),
  }));

  const ticket = await Ticket.create({
    ticketId,
    title: title.trim(),
    description: description.trim(),
    category: categoryDoc._id,
    priority,
    status: TICKET_STATUS.OPEN,
    createdBy: user._id,
    assignedTo: null,
    attachments: formattedAttachments,
    sla: {
      rule: slaRule._id,
      responseDeadline,
      resolutionDeadline,
      responseStatus: SLA_STATUS.PENDING,
      resolutionStatus: SLA_STATUS.PENDING,
      warningTriggered: false,
      isBreached: false,
    },
    escalation: {
      isEscalated: false,
    },
  });

  await TicketHistory.create({
    ticket: ticket._id,
    performedBy: user._id,
    action: HISTORY_ACTIONS.CREATED,
    previousValue: null,
    newValue: {
      status: TICKET_STATUS.OPEN,
      priority,
      category: categoryDoc.name,
    },
    details: `Ticket created with ${priority} priority`,
    timestamp: new Date(),
  });

  const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
  if (admins.length > 0) {
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      type: NOTIFICATION_TYPES.TICKET_CREATED,
      title: `New Ticket Raised: ${ticket.ticketId}`,
      message: `${user.name} raised ticket "${ticket.title}" (${ticket.priority} priority)`,
      ticket: ticket._id,
      isRead: false,
    }));
    await Notification.insertMany(notifications);
  }

  return await Ticket.findById(ticket._id)
    .populate('category', 'name description')
    .populate('createdBy', 'name email department phone avatar')
    .populate('assignedTo', 'name email department phone avatar');
};

export const assignTicket = async (id, agentId, adminUser) => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== ROLES.AGENT || !agent.isActive) {
    const error = new Error('Selected agent is invalid, inactive, or not an AGENT role');
    error.statusCode = 400;
    throw error;
  }

  const previousAgentId = ticket.assignedTo;
  let previousAgentName = 'Unassigned';
  if (previousAgentId) {
    const prevUser = await User.findById(previousAgentId);
    if (prevUser) previousAgentName = prevUser.name;
  }

  const isReassignment = Boolean(previousAgentId && previousAgentId.toString() !== agentId.toString());

  ticket.assignedTo = agent._id;
  if (ticket.status === TICKET_STATUS.OPEN) {
    ticket.status = TICKET_STATUS.ASSIGNED;
  }
  await ticket.save();

  await TicketHistory.create({
    ticket: ticket._id,
    performedBy: adminUser._id,
    action: isReassignment ? HISTORY_ACTIONS.REASSIGNED : HISTORY_ACTIONS.ASSIGNED,
    previousValue: { assignedTo: previousAgentName },
    newValue: { assignedTo: agent.name, status: ticket.status },
    details: isReassignment
      ? `Ticket reassigned from ${previousAgentName} to ${agent.name} by ${adminUser.name}`
      : `Ticket assigned to Agent ${agent.name} by ${adminUser.name}`,
    timestamp: new Date(),
  });

  await Notification.create({
    recipient: agent._id,
    type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
    title: `Ticket Assigned: ${ticket.ticketId}`,
    message: `You have been assigned ticket "${ticket.title}" (${ticket.priority} priority)`,
    ticket: ticket._id,
    isRead: false,
  });

  return await Ticket.findById(ticket._id)
    .populate('category', 'name description')
    .populate('createdBy', 'name email department phone avatar')
    .populate('assignedTo', 'name email department phone avatar')
    .populate('sla.rule');
};

export const updateTicketStatus = async (id, newStatus, user, reason = '') => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Resource Access Authorization Check
  if (user.role === ROLES.EMPLOYEE && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('Access denied: You do not own this ticket');
    error.statusCode = 403;
    throw error;
  }

  if (
    user.role === ROLES.AGENT &&
    ticket.assignedTo &&
    ticket.assignedTo.toString() !== user._id.toString()
  ) {
    const error = new Error('Access denied: You are not assigned to this ticket');
    error.statusCode = 403;
    throw error;
  }

  // 2. Validate Allowed Status Transitions
  const allowed = ALLOWED_TRANSITIONS[ticket.status] || [];
  const transitionMatch = allowed.find(
    (t) => t.next === newStatus && t.roles.includes(user.role)
  );

  if (!transitionMatch) {
    const error = new Error(
      `Invalid status transition from '${ticket.status}' to '${newStatus}' for role '${user.role}'`
    );
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = ticket.status;
  const now = new Date();
  ticket.status = newStatus;

  // 3. Status-Specific Lifecycle Hooks & SLA calculations
  let actionType = HISTORY_ACTIONS.STATUS_CHANGED;

  // Case A: Shift to IN_PROGRESS (Agent acceptance or resuming work)
  if (newStatus === TICKET_STATUS.IN_PROGRESS) {
    if (!ticket.sla.firstRespondedAt && user.role === ROLES.AGENT) {
      ticket.sla.firstRespondedAt = now;
      if (ticket.sla.responseDeadline && now <= ticket.sla.responseDeadline) {
        ticket.sla.responseStatus = SLA_STATUS.MET;
      } else if (ticket.sla.responseDeadline) {
        ticket.sla.responseStatus = SLA_STATUS.BREACHED;
      }
    }
  }

  // Case B: Shift to RESOLVED
  if (newStatus === TICKET_STATUS.RESOLVED) {
    actionType = HISTORY_ACTIONS.RESOLVED;
    ticket.resolvedAt = now;

    if (ticket.sla.resolutionDeadline && now <= ticket.sla.resolutionDeadline) {
      ticket.sla.resolutionStatus = SLA_STATUS.MET;
    } else if (ticket.sla.resolutionDeadline) {
      ticket.sla.resolutionStatus = SLA_STATUS.BREACHED;
    }

    // Notify ticket creator (Employee) to verify & confirm resolution
    await Notification.create({
      recipient: ticket.createdBy,
      type: NOTIFICATION_TYPES.TICKET_RESOLVED,
      title: `Ticket Resolved: ${ticket.ticketId}`,
      message: `Your ticket "${ticket.title}" has been marked as resolved by ${user.name}. Please confirm resolution or reopen.`,
      ticket: ticket._id,
      isRead: false,
    });
  }

  // Case C: Shift to CLOSED
  if (newStatus === TICKET_STATUS.CLOSED) {
    actionType = HISTORY_ACTIONS.CLOSED;
    ticket.closedAt = now;

    // Notify assigned agent if closed by employee/admin
    if (ticket.assignedTo && ticket.assignedTo.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: ticket.assignedTo,
        type: NOTIFICATION_TYPES.TICKET_CLOSED,
        title: `Ticket Closed: ${ticket.ticketId}`,
        message: `Ticket "${ticket.title}" has been confirmed and closed by ${user.name}.`,
        ticket: ticket._id,
        isRead: false,
      });
    }
  }

  // Case D: Shift to REOPENED
  if (newStatus === TICKET_STATUS.REOPENED) {
    actionType = HISTORY_ACTIONS.REOPENED;
    ticket.reopenedCount = (ticket.reopenedCount || 0) + 1;
    ticket.resolvedAt = null;
    ticket.closedAt = null;

    // Notify assigned agent and admin
    if (ticket.assignedTo) {
      await Notification.create({
        recipient: ticket.assignedTo,
        type: NOTIFICATION_TYPES.TICKET_REOPENED,
        title: `Ticket Reopened: ${ticket.ticketId}`,
        message: `Ticket "${ticket.title}" has been reopened by ${user.name}. Reason: ${reason || 'Issue persists'}`,
        ticket: ticket._id,
        isRead: false,
      });
    }
  }

  await ticket.save();

  // 4. Record History Audit
  await TicketHistory.create({
    ticket: ticket._id,
    performedBy: user._id,
    action: actionType,
    previousValue: { status: oldStatus },
    newValue: { status: newStatus },
    details: reason
      ? `Status changed from ${oldStatus} to ${newStatus}. Note: ${reason}`
      : `Status changed from ${oldStatus} to ${newStatus} by ${user.name} (${user.role})`,
    timestamp: now,
  });

  return await Ticket.findById(ticket._id)
    .populate('category', 'name description')
    .populate('createdBy', 'name email department phone avatar')
    .populate('assignedTo', 'name email department phone avatar')
    .populate('sla.rule');
};

export const updateTicketPriority = async (id, newPriority, adminUser) => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const oldPriority = ticket.priority;
  ticket.priority = newPriority;

  // Recalculate SLA based on new priority
  let slaRule = await SLARule.findOne({ priority: newPriority });
  if (!slaRule) {
    const defaultRule = DEFAULT_SLA_RULES.find((r) => r.priority === newPriority) || DEFAULT_SLA_RULES[2];
    slaRule = await SLARule.create(defaultRule);
  }

  const now = new Date();
  ticket.sla.rule = slaRule._id;
  ticket.sla.responseDeadline = new Date(now.getTime() + slaRule.responseDeadlineMinutes * 60 * 1000);
  ticket.sla.resolutionDeadline = new Date(now.getTime() + slaRule.resolutionDeadlineMinutes * 60 * 1000);
  ticket.sla.warningTriggered = false;

  await ticket.save();

  // History log
  await TicketHistory.create({
    ticket: ticket._id,
    performedBy: adminUser._id,
    action: HISTORY_ACTIONS.PRIORITY_CHANGED,
    previousValue: { priority: oldPriority },
    newValue: { priority: newPriority },
    details: `Priority changed from ${oldPriority} to ${newPriority} by Admin ${adminUser.name}. SLA deadlines recalculated.`,
    timestamp: now,
  });

  return await Ticket.findById(ticket._id)
    .populate('category', 'name description')
    .populate('createdBy', 'name email department phone avatar')
    .populate('assignedTo', 'name email department phone avatar')
    .populate('sla.rule');
};

export const getTickets = async (user, query = {}) => {
  const {
    status,
    priority,
    category,
    assignedTo,
    isBreached,
    isEscalated,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.AGENT) {
    if (assignedTo && assignedTo === 'unassigned') {
      filter.assignedTo = null;
      filter.status = TICKET_STATUS.OPEN;
    } else {
      filter.assignedTo = user._id;
    }
  } else if (user.role === ROLES.ADMIN) {
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        filter.assignedTo = null;
      } else {
        filter.assignedTo = assignedTo;
      }
    }
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (isBreached !== undefined && isBreached !== '') {
    filter['sla.isBreached'] = isBreached === 'true' || isBreached === true;
  }
  if (isEscalated !== undefined && isEscalated !== '') {
    filter['escalation.isEscalated'] = isEscalated === 'true' || isEscalated === true;
  }

  if (search) {
    filter.$or = [
      { ticketId: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email department phone avatar')
      .populate('assignedTo', 'name email department phone avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getTicketById = async (id, user) => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketId: id };

  const ticket = await Ticket.findOne(query)
    .populate('category', 'name description')
    .populate('createdBy', 'name email department phone avatar')
    .populate('assignedTo', 'name email department phone avatar')
    .populate('sla.rule');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === ROLES.EMPLOYEE && ticket.createdBy._id.toString() !== user._id.toString()) {
    const error = new Error('Access denied: You do not own this ticket');
    error.statusCode = 403;
    throw error;
  }

  if (
    user.role === ROLES.AGENT &&
    ticket.assignedTo &&
    ticket.assignedTo._id.toString() !== user._id.toString()
  ) {
    const error = new Error('Access denied: You are not assigned to this ticket');
    error.statusCode = 403;
    throw error;
  }

  return ticket;
};
