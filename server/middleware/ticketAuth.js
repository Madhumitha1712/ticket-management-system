import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import { ROLES } from '../config/constants.js';

export const checkTicketAccess = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { ticketId: id };

    const ticket = await Ticket.findOne(query)
      .populate('category', 'name description')
      .populate('createdBy', 'name email department phone avatar')
      .populate('assignedTo', 'name email department phone avatar');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role-based Resource Authorization Gates
    if (user.role === ROLES.ADMIN) {
      // Admins have unrestricted system access
      req.ticket = ticket;
      return next();
    }

    if (user.role === ROLES.AGENT) {
      // Agents can access if assigned to them or if currently unassigned (for triage)
      const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this ticket',
        });
      }
      req.ticket = ticket;
      return next();
    }

    if (user.role === ROLES.EMPLOYEE) {
      // Employees can only access tickets they created
      const isCreator = ticket.createdBy && ticket.createdBy._id.toString() === user._id.toString();
      if (!isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not own this ticket',
        });
      }
      req.ticket = ticket;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Unauthorized role',
    });
  } catch (error) {
    next(error);
  }
};
