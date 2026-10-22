import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidator, validateRequest, authController.updateProfile);
router.put('/password', protect, changePasswordValidator, validateRequest, authController.changePassword);

export default router;
