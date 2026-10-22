import express from 'express';
import * as slaController from '../controllers/slaController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import { updateSLARuleValidator } from '../validators/slaValidator.js';

const router = express.Router();

router.use(protect);

// View SLA Rules (accessible to all logged-in roles)
router.get('/rules', slaController.getSLARules);

// Admin-only SLA rule modifications
router.put(
  '/rules/:id',
  authorize(ROLES.ADMIN),
  updateSLARuleValidator,
  validateRequest,
  slaController.updateSLARule
);

// Admin-only Escalations and Breached Tickets Queue
router.get('/escalations', authorize(ROLES.ADMIN), slaController.getEscalatedTickets);

// Admin trigger for manual SLA batch scan
router.post('/check', authorize(ROLES.ADMIN), slaController.triggerSLACheck);

export default router;
