import * as feedbackService from '../services/feedbackService.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.submitFeedback(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackByTicket = async (req, res, next) => {
  try {
    const feedback = await feedbackService.getFeedbackByTicket(req.params.ticketId);
    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentFeedback = async (req, res, next) => {
  try {
    const data = await feedbackService.getAgentFeedback(req.params.agentId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
