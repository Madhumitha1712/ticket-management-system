import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.js';

export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
];

export const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

export const toggleStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];
