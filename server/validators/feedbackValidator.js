import { body, param } from 'express-validator';

export const submitFeedbackValidator = [
  body('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback comment cannot exceed 500 characters'),
];

export const getAgentFeedbackValidator = [
  param('agentId')
    .isMongoId()
    .withMessage('Invalid Agent ID format'),
];
