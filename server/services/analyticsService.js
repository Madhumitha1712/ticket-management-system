import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Feedback from '../models/Feedback.js';
import { ROLES, TICKET_STATUS, TICKET_PRIORITY, SLA_STATUS } from '../config/constants.js';

export const getDashboardAnalytics = async (user) => {
  if (user.role === ROLES.ADMIN) {
    return await getAdminDashboardAnalytics();
  } else if (user.role === ROLES.AGENT) {
    return await getAgentDashboardAnalytics(user._id);
  } else {
    return await getEmployeeDashboardAnalytics(user._id);
  }
};

const getAdminDashboardAnalytics = async () => {
  const [
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    pendingTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
    breachedTickets,
    escalatedTickets,
    totalUsers,
    totalAgents,
    categories,
    feedbacks,
  ] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: TICKET_STATUS.OPEN }),
    Ticket.countDocuments({ status: TICKET_STATUS.ASSIGNED }),
    Ticket.countDocuments({ status: TICKET_STATUS.IN_PROGRESS }),
    Ticket.countDocuments({ status: TICKET_STATUS.PENDING }),
    Ticket.countDocuments({ status: TICKET_STATUS.RESOLVED }),
    Ticket.countDocuments({ status: TICKET_STATUS.CLOSED }),
    Ticket.countDocuments({ priority: TICKET_PRIORITY.CRITICAL }),
    Ticket.countDocuments({ 'sla.isBreached': true }),
    Ticket.countDocuments({ 'escalation.isEscalated': true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: ROLES.AGENT, isActive: true }),
    Category.find({ isActive: true }).select('name'),
    Feedback.find().select('rating'),
  ]);

  // Breakdown by Priority
  const priorityCounts = await Ticket.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const ticketsByPriority = Object.values(TICKET_PRIORITY).map((p) => {
    const match = priorityCounts.find((item) => item._id === p);
    return { name: p, count: match ? match.count : 0 };
  });

  // Breakdown by Status
  const statusCounts = await Ticket.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ticketsByStatus = Object.values(TICKET_STATUS).map((s) => {
    const match = statusCounts.find((item) => item._id === s);
    return { name: s, count: match ? match.count : 0 };
  });

  // Breakdown by Category
  const categoryCounts = await Ticket.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const ticketsByCategory = categories.map((cat) => {
    const match = categoryCounts.find((item) => item._id && item._id.toString() === cat._id.toString());
    return { name: cat.name, count: match ? match.count : 0 };
  });

  // Calculate Average Resolution Time (in hours) for resolved/closed tickets
  const resolvedDocs = await Ticket.find({
    resolvedAt: { $exists: true, $ne: null },
  }).select('createdAt resolvedAt');

  let avgResolutionHours = 0;
  if (resolvedDocs.length > 0) {
    const totalMs = resolvedDocs.reduce((acc, curr) => {
      return acc + (new Date(curr.resolvedAt).getTime() - new Date(curr.createdAt).getTime());
    }, 0);
    avgResolutionHours = Number((totalMs / resolvedDocs.length / (1000 * 60 * 60)).toFixed(1));
  }

  // Calculate Average Satisfaction Rating
  const avgRating =
    feedbacks.length > 0
      ? Number((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1))
      : 5.0;

  // Calculate SLA Compliance Rate (%)
  const totalCompletedSla = await Ticket.countDocuments({
    'sla.resolutionStatus': { $in: [SLA_STATUS.MET, SLA_STATUS.BREACHED] },
  });
  const metSla = await Ticket.countDocuments({
    'sla.resolutionStatus': SLA_STATUS.MET,
  });
  const slaComplianceRate =
    totalCompletedSla > 0 ? Number(((metSla / totalCompletedSla) * 100).toFixed(1)) : 100;

  return {
    summary: {
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      pendingTickets,
      resolvedTickets,
      closedTickets,
      criticalTickets,
      breachedTickets,
      escalatedTickets,
      totalUsers,
      totalAgents,
      avgResolutionHours,
      avgRating,
      slaComplianceRate,
    },
    charts: {
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
    },
  };
};

const getAgentDashboardAnalytics = async (agentId) => {
  const [
    assignedTotal,
    assignedOpen,
    inProgress,
    pending,
    resolved,
    closed,
    slaBreached,
    slaWarning,
    feedbacks,
  ] = await Promise.all([
    Ticket.countDocuments({ assignedTo: agentId }),
    Ticket.countDocuments({ assignedTo: agentId, status: TICKET_STATUS.ASSIGNED }),
    Ticket.countDocuments({ assignedTo: agentId, status: TICKET_STATUS.IN_PROGRESS }),
    Ticket.countDocuments({ assignedTo: agentId, status: TICKET_STATUS.PENDING }),
    Ticket.countDocuments({ assignedTo: agentId, status: TICKET_STATUS.RESOLVED }),
    Ticket.countDocuments({ assignedTo: agentId, status: TICKET_STATUS.CLOSED }),
    Ticket.countDocuments({ assignedTo: agentId, 'sla.isBreached': true }),
    Ticket.countDocuments({
      assignedTo: agentId,
      'sla.warningTriggered': true,
      status: { $in: [TICKET_STATUS.ASSIGNED, TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.PENDING] },
    }),
    Feedback.find({ agent: agentId }).select('rating'),
  ]);

  const avgRating =
    feedbacks.length > 0
      ? Number((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1))
      : 5.0;

  // Agent resolution rate
  const completedCount = resolved + closed;
  const resolutionRate =
    assignedTotal > 0 ? Number(((completedCount / assignedTotal) * 100).toFixed(1)) : 100;

  return {
    summary: {
      assignedTotal,
      assignedOpen,
      inProgress,
      pending,
      resolved,
      closed,
      activeQueue: assignedOpen + inProgress + pending,
      slaWarning,
      slaBreached,
      avgRating,
      resolutionRate,
    },
  };
};

const getEmployeeDashboardAnalytics = async (employeeId) => {
  const [
    totalRaised,
    openCount,
    inProgressCount,
    pendingCount,
    resolvedCount,
    closedCount,
  ] = await Promise.all([
    Ticket.countDocuments({ createdBy: employeeId }),
    Ticket.countDocuments({ createdBy: employeeId, status: TICKET_STATUS.OPEN }),
    Ticket.countDocuments({
      createdBy: employeeId,
      status: { $in: [TICKET_STATUS.ASSIGNED, TICKET_STATUS.IN_PROGRESS] },
    }),
    Ticket.countDocuments({ createdBy: employeeId, status: TICKET_STATUS.PENDING }),
    Ticket.countDocuments({ createdBy: employeeId, status: TICKET_STATUS.RESOLVED }),
    Ticket.countDocuments({ createdBy: employeeId, status: TICKET_STATUS.CLOSED }),
  ]);

  return {
    summary: {
      totalRaised,
      openCount,
      inProgressCount,
      pendingCount,
      resolvedCount,
      closedCount,
      activeTotal: openCount + inProgressCount + pendingCount,
    },
  };
};

export const getAgentLeaderboard = async () => {
  const agents = await User.find({ role: ROLES.AGENT, isActive: true }).select('name email department avatar');

  const leaderboard = await Promise.all(
    agents.map(async (agent) => {
      const [assigned, resolved, closed, breached, feedbacks] = await Promise.all([
        Ticket.countDocuments({ assignedTo: agent._id }),
        Ticket.countDocuments({ assignedTo: agent._id, status: TICKET_STATUS.RESOLVED }),
        Ticket.countDocuments({ assignedTo: agent._id, status: TICKET_STATUS.CLOSED }),
        Ticket.countDocuments({ assignedTo: agent._id, 'sla.isBreached': true }),
        Feedback.find({ agent: agent._id }).select('rating'),
      ]);

      const totalCompleted = resolved + closed;
      const resolutionRate = assigned > 0 ? Number(((totalCompleted / assigned) * 100).toFixed(1)) : 100;
      const avgRating =
        feedbacks.length > 0
          ? Number((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1))
          : 5.0;

      return {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        department: agent.department,
        avatar: agent.avatar,
        assigned,
        resolved: totalCompleted,
        breached,
        resolutionRate,
        avgRating,
        totalReviews: feedbacks.length,
      };
    })
  );

  return leaderboard.sort((a, b) => b.resolved - a.resolved);
};
