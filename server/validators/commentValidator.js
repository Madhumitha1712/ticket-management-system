import { body } from 'express-validator';

export const addCommentValidator = [
  body().custom((value, { req }) => {
    const text = req.body.message || req.body.content;
    if (!text || !text.trim()) {
      throw new Error('Comment message cannot be empty');
    }
    return true;
  }),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean value'),
];
