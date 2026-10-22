import Ticket from '../models/Ticket.js';
import SLARule from '../models/SLARule.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  ROLES,
  TICKET_STATUS,
  SLA_STATUS,
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
  DEFAULT_SLA_RULES,
} from '../config/constants.js';

export const getSLARules = async () => {
  let rules = await SLARule.find().sort({ responseDeadlineMinutes: 1 });
  if (rules.length === 0) {
    // Seed default SLA rules if empty
    rules = await SLARule.insertMany(DEFAULT_SLA_RULES);
  }
  return rules;
};

export const updateSLARule = async (id, { responseDeadlineMinutes, resolutionDeadlineMinutes, warningThresholdPercent, description }) => {
  const rule = await SLARule.findById(id);
  if (!rule) {
    const error = new Error('SLA rule not found');
    error.statusCode = 404;
    throw error;
  }

  if (responseDeadlineMinutes) rule.responseDeadlineMinutes = Number(responseDeadlineMinutes);
  if (resolutionDeadlineMinutes) rule.resolutionDeadlineMinutes = Number(resolutionDeadlineMinutes);
  if (warningThresholdPercent) rule.warningThresholdPercent = Number(warningThresholdPercent);
  if (description !== undefined) rule.description = description;

  await rule.save();
  return rule;
};

export const getEscalatedTickets = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const filter = {
    $or: [
      { 'escalation.isEscalated': true },
      { 'sla.isBreached': true },
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email department phone avatar')
      .populate('assignedTo', 'name email department phone avatar')
      .populate('sla.rule')
      .sort({ 'escalation.escalatedAt': -1, createdAt: -1 })
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

export const checkSLABreachesAndWarnings = async () => {
  const now = new Date();
  
  // Find active, unclosed, unresolved tickets
  const activeTickets = await Ticket.find({
    status: {
      $nin: [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED],
    },
  }).populate('sla.rule');

  let warnedCount = 0;
  let breachedCount = 0;

  // Retrieve Admins for alert distribution
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true });

  for (const ticket of activeTickets) {
    let ticketModified = false;
    const createdAtTime = new Date(ticket.createdAt).getTime();
    const resolutionDeadlineTime = ticket.sla.resolutionDeadline
      ? new Date(ticket.sla.resolutionDeadline).getTime()
      : null;
    const responseDeadlineTime = ticket.sla.responseDeadline
      ? new Date(ticket.sla.responseDeadline).getTime()
      : null;
    const currentTime = now.getTime();

    // 1. Response SLA Breach Check (if no response has been made)
    if (
      responseDeadlineTime &&
      !ticket.sla.firstRespondedAt &&
      currentTime > responseDeadlineTime &&
      ticket.sla.responseStatus === SLA_STATUS.PENDING
    ) {
      ticket.sla.responseStatus = SLA_STATUS.BREACHED;
      ticketModified = true;

      await TicketHistory.create({
        ticket: ticket._id,
        performedBy: ticket.assignedTo || ticket.createdBy,
        action: HISTORY_ACTIONS.SLA_BREACHED,
        previousValue: { responseStatus: SLA_STATUS.PENDING },
        newValue: { responseStatus: SLA_STATUS.BREACHED },
        details: `SLA Response Deadline exceeded (${ticket.ticketId})`,
        timestamp: now,
      });
    }

    // 2. Resolution SLA 80% Warning Trigger
    if (resolutionDeadlineTime && !ticket.sla.warningTriggered && !ticket.sla.isBreached) {
      const totalResolutionDuration = resolutionDeadlineTime - createdAtTime;
      const elapsed = currentTime - createdAtTime;
      const warningThreshold = ticket.sla.rule?.warningThresholdPercent || 80;
      const warningTime = (totalResolutionDuration * warningThreshold) / 100;

      if (elapsed >= warningTime && currentTime < resolutionDeadlineTime) {
        ticket.sla.warningTriggered = true;
        ticketModified = true;
        warnedCount++;

        // Audit log
        await TicketHistory.create({
          ticket: ticket._id,
          performedBy: ticket.assignedTo || ticket.createdBy,
          action: HISTORY_ACTIONS.SLA_WARNING,
          previousValue: { warningTriggered: false },
          newValue: { warningTriggered: true },
          details: `Ticket reached ${warningThreshold}% of SLA resolution window`,
          timestamp: now,
        });

        // Notify Assigned Agent and Admins
        const notificationRecipients = [];
        if (ticket.assignedTo) notificationRecipients.push(ticket.assignedTo);
        admins.forEach((admin) => {
          if (!notificationRecipients.some((r) => r.toString() === admin._id.toString())) {
            notificationRecipients.push(admin._id);
          }
        });

        const warningNotifications = notificationRecipients.map((recipientId) => ({
          recipient: recipientId,
          type: NOTIFICATION_TYPES.SLA_WARNING,
          title: `SLA Warning: ${ticket.ticketId}`,
          message: `Ticket "${ticket.title}" (${ticket.priority}) is approaching its SLA deadline.`,
          ticket: ticket._id,
          isRead: false,
        }));

        if (warningNotifications.length > 0) {
          await Notification.insertMany(warningNotifications);
        }
      }
    }

    // 3. Resolution SLA Breach & Automatic Escalation Trigger
    if (resolutionDeadlineTime && currentTime > resolutionDeadlineTime && !ticket.sla.isBreached) {
      ticket.sla.isBreached = true;
      ticket.sla.resolutionStatus = SLA_STATUS.BREACHED;
      ticket.escalation = {
        isEscalated: true,
        escalatedAt: now,
        reason: 'SLA Resolution Deadline Exceeded',
      };
      ticketModified = true;
      breachedCount++;

      // Audit Log for Breach & Escalation
      await TicketHistory.create({
        ticket: ticket._id,
        performedBy: ticket.assignedTo || ticket.createdBy,
        action: HISTORY_ACTIONS.SLA_BREACHED,
        previousValue: { isBreached: false },
        newValue: { isBreached: true, isEscalated: true },
        details: `SLA Resolution Deadline breached. Ticket automatically escalated to Administration.`,
        timestamp: now,
      });

      // Notify Admins & Agent of Breach & Escalation
      const breachRecipients = [];
      if (ticket.assignedTo) breachRecipients.push(ticket.assignedTo);
      admins.forEach((admin) => {
        if (!breachRecipients.some((r) => r.toString() === admin._id.toString())) {
          breachRecipients.push(admin._id);
        }
      });

      const breachNotifications = breachRecipients.map((recipientId) => ({
        recipient: recipientId,
        type: NOTIFICATION_TYPES.SLA_BREACHED,
        title: `CRITICAL SLA Breach: ${ticket.ticketId}`,
        message: `Ticket "${ticket.title}" has breached resolution deadline and is escalated to Admin.`,
        ticket: ticket._id,
        isRead: false,
      }));

      if (breachNotifications.length > 0) {
        await Notification.insertMany(breachNotifications);
      }
    }

    if (ticketModified) {
      await ticket.save();
    }
  }

  return {
    inspected: activeTickets.length,
    warned: warnedCount,
    breached: breachedCount,
    timestamp: now,
  };
};
