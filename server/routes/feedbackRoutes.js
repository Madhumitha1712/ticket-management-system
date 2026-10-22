import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  submitFeedbackValidator,
  getAgentFeedbackValidator,
} from '../validators/feedbackValidator.js';

const router = express.Router();

router.use(protect);

// Employee submits feedback for a resolved/closed ticket
router.post(
  '/',
  authorize(ROLES.EMPLOYEE, ROLES.ADMIN),
  submitFeedbackValidator,
  validateRequest,
  feedbackController.submitFeedback
);

// View feedback for a specific ticket
router.get('/ticket/:ticketId', feedbackController.getFeedbackByTicket);

// Admin & Agents view agent performance reviews
router.get(
  '/agent/:agentId',
  authorize(ROLES.ADMIN, ROLES.AGENT),
  getAgentFeedbackValidator,
  validateRequest,
  feedbackController.getAgentFeedback
);

export default router;
