import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  createCategoryValidator,
  updateCategoryValidator,
} from '../validators/categoryValidator.js';

const router = express.Router();

router.use(protect);

// Listing categories is accessible to all logged-in users
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Category modifications are restricted to ADMIN
router.post('/', authorize(ROLES.ADMIN), createCategoryValidator, validateRequest, categoryController.createCategory);
router.put('/:id', authorize(ROLES.ADMIN), updateCategoryValidator, validateRequest, categoryController.updateCategory);
router.delete('/:id', authorize(ROLES.ADMIN), categoryController.deleteCategory);

export default router;
