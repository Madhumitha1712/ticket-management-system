import TicketHistory from '../models/TicketHistory.js';
import Ticket from '../models/Ticket.js';

export const getTicketHistory = async (ticketId) => {
  const isObjectId = typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  return await TicketHistory.find({ ticket: ticket._id })
    .populate('performedBy', 'name email role department avatar')
    .sort({ timestamp: 1 });
};
