import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { checkTicketAccess } from '../middleware/ticketAuth.js';
import { uploadAttachment } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  createTicketValidator,
  assignTicketValidator,
  updateStatusValidator,
  updatePriorityValidator,
} from '../validators/ticketValidator.js';
import { addCommentValidator } from '../validators/commentValidator.js';

const router = express.Router();

router.use(protect);

// Create new ticket (supports multiple file attachments)
router.post(
  '/',
  uploadAttachment.array('attachments', 5),
  createTicketValidator,
  validateRequest,
  ticketController.createTicket
);

// Admin-only Ticket Assignment / Reassignment
router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  assignTicketValidator,
  validateRequest,
  ticketController.assignTicket
);

// Update Ticket Status (validated by strict state-machine rules per role)
router.patch(
  '/:id/status',
  updateStatusValidator,
  validateRequest,
  ticketController.updateTicketStatus
);

// Admin-only Priority Change & SLA Recalculation
router.patch(
  '/:id/priority',
  authorize(ROLES.ADMIN),
  updatePriorityValidator,
  validateRequest,
  ticketController.updateTicketPriority
);

// Comments & Conversations on Tickets (enforcing checkTicketAccess)
router.get('/:id/comments', checkTicketAccess, commentController.getTicketComments);
router.post(
  '/:id/comments',
  checkTicketAccess,
  uploadAttachment.array('attachments', 5),
  addCommentValidator,
  validateRequest,
  commentController.addComment
);

// Immutable Activity History Log (enforcing checkTicketAccess)
router.get('/:id/history', checkTicketAccess, commentController.getTicketHistory);

// Get tickets (scoped according to user role & query filters)
router.get('/', ticketController.getTickets);

// Get specific ticket details (with resource access authorization gate)
router.get('/:id', checkTicketAccess, ticketController.getTicketById);

export default router;
