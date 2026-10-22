import Feedback from '../models/Feedback.js';
import Ticket from '../models/Ticket.js';
import { TICKET_STATUS, ROLES } from '../config/constants.js';

export const submitFeedback = async ({ ticketId, rating, comment }, user) => {
  const isObjectId = typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the creator Employee (or Admin) can submit feedback
  if (user.role === ROLES.EMPLOYEE && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('Access denied: You can only submit feedback for tickets you raised');
    error.statusCode = 403;
    throw error;
  }

  // Feedback allowed only on RESOLVED or CLOSED tickets
  if (ticket.status !== TICKET_STATUS.RESOLVED && ticket.status !== TICKET_STATUS.CLOSED) {
    const error = new Error(`Feedback can only be submitted for resolved or closed tickets (current status: ${ticket.status})`);
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate feedback submissions
  const existingFeedback = await Feedback.findOne({ ticket: ticket._id });
  if (existingFeedback) {
    const error = new Error('Feedback has already been submitted for this ticket');
    error.statusCode = 409;
    throw error;
  }

  const feedback = await Feedback.create({
    ticket: ticket._id,
    employee: user._id,
    agent: ticket.assignedTo || null,
    rating: Number(rating),
    comment: (comment || '').trim(),
  });

  return await Feedback.findById(feedback._id)
    .populate('employee', 'name email department avatar')
    .populate('agent', 'name email department avatar')
    .populate('ticket', 'ticketId title status priority');
};

export const getFeedbackByTicket = async (ticketId) => {
  const isObjectId = typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const feedback = await Feedback.findOne({ ticket: ticket._id })
    .populate('employee', 'name email department avatar')
    .populate('agent', 'name email department avatar');

  return feedback;
};

export const getAgentFeedback = async (agentId) => {
  const reviews = await Feedback.find({ agent: agentId })
    .populate('employee', 'name department avatar')
    .populate('ticket', 'ticketId title')
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(2))
      : 0;

  return {
    agentId,
    averageRating,
    totalReviews,
    reviews,
  };
};
