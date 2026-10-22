import * as slaEngine from '../services/slaEngine.js';

export const getSLARules = async (req, res, next) => {
  try {
    const rules = await slaEngine.getSLARules();
    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSLARule = async (req, res, next) => {
  try {
    const rule = await slaEngine.updateSLARule(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'SLA Rule updated successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const getEscalatedTickets = async (req, res, next) => {
  try {
    const result = await slaEngine.getEscalatedTickets(req.query);
    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerSLACheck = async (req, res, next) => {
  try {
    const summary = await slaEngine.checkSLABreachesAndWarnings();
    res.status(200).json({
      success: true,
      message: 'SLA check completed',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
