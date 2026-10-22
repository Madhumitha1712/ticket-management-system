import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

// Role-scoped dashboard metrics (Admin / Agent / Employee)
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Admin-only agent performance leaderboard
router.get('/agent-leaderboard', authorize(ROLES.ADMIN), analyticsController.getAgentLeaderboard);

export default router;
