import * as analyticsService from '../services/analyticsService.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardAnalytics(req.user);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await analyticsService.getAgentLeaderboard();
    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
