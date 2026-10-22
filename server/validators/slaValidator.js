import { body, param } from 'express-validator';

export const updateSLARuleValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid SLA Rule ID format'),
  body('responseDeadlineMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Response deadline must be an integer >= 1 minute'),
  body('resolutionDeadlineMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Resolution deadline must be an integer >= 1 minute'),
  body('warningThresholdPercent')
    .optional()
    .isInt({ min: 10, max: 99 })
    .withMessage('Warning threshold must be between 10% and 99%'),
];
