import Ticket from '../models/Ticket.js';

export const generateTicketId = async () => {
  const count = await Ticket.countDocuments();
  const nextNumber = 1000 + count + 1;
  const candidateId = `TKT-${nextNumber}`;

  // Ensure collision safety
  const exists = await Ticket.findOne({ ticketId: candidateId });
  if (exists) {
    const timestampSuffix = Date.now().toString().slice(-4);
    return `TKT-${nextNumber}-${timestampSuffix}`;
  }

  return candidateId;
};
