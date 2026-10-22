import { body } from 'express-validator';
import { TICKET_PRIORITY, TICKET_STATUS } from '../config/constants.js';

export const createTicketValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Ticket title is required')
    .isLength({ max: 200 })
    .withMessage('Ticket title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Ticket description is required'),
  body('category')
    .notEmpty()
    .withMessage('Ticket category is required')
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('priority')
    .optional()
    .isIn(Object.values(TICKET_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`),
];

export const assignTicketValidator = [
  body().custom((value, { req }) => {
    const id = req.body.agentId || req.body.assignedTo;
    if (!id) {
      throw new Error('Agent ID is required (agentId or assignedTo)');
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id.toString())) {
      throw new Error('Invalid Agent ID format');
    }
    return true;
  }),
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TICKET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TICKET_STATUS).join(', ')}`),
  body('reason')
    .optional()
    .trim(),
];

export const updatePriorityValidator = [
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(TICKET_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`),
];
