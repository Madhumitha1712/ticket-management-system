import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  createUserValidator,
  updateUserValidator,
  toggleStatusValidator,
} from '../validators/userValidator.js';

const router = express.Router();

// Apply base authentication to all user routes
router.use(protect);

// Agents list: Accessible to Admin and Agent
router.get('/agents', authorize(ROLES.ADMIN, ROLES.AGENT), userController.getActiveAgents);

// Admin-only User Management Routes
router.get('/', authorize(ROLES.ADMIN), userController.getAllUsers);
router.post('/', authorize(ROLES.ADMIN), createUserValidator, validateRequest, userController.createUser);
router.get('/:id', authorize(ROLES.ADMIN), userController.getUserById);
router.put('/:id', authorize(ROLES.ADMIN), updateUserValidator, validateRequest, userController.updateUser);
router.patch('/:id/status', authorize(ROLES.ADMIN), toggleStatusValidator, validateRequest, userController.toggleUserStatus);

export default router;
