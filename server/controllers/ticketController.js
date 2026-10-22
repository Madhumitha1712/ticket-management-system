import * as ticketService from '../services/ticketService.js';

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    
    const attachments = (req.files || []).map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
    }));

    const ticket = await ticketService.createTicket(
      { title, description, category, priority, attachments },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const agentId = req.body.agentId || req.body.assignedTo;
    const ticket = await ticketService.assignTicket(req.params.id, agentId, req.user);
    res.status(200).json({
      success: true,
      message: `Ticket assigned to agent successfully`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const ticket = await ticketService.updateTicketStatus(req.params.id, status, req.user, reason);
    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const ticket = await ticketService.updateTicketPriority(req.params.id, priority, req.user);
    res.status(200).json({
      success: true,
      message: `Ticket priority updated to ${priority}`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTickets(req.user, req.query);
    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    if (req.ticket) {
      return res.status(200).json({
        success: true,
        data: req.ticket,
      });
    }

    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
