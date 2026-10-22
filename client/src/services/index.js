import api from './api.js';
import { authService } from './authService.js';
import { ticketService } from './ticketService.js';

export const categoryService = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

export const slaService = {
  getRules: async () => {
    const res = await api.get('/sla/rules');
    return res.data.data;
  },

  updateRule: async (id, data) => {
    const res = await api.put(`/sla/rules/${id}`, data);
    return res.data.data;
  },

  getEscalations: async (params = {}) => {
    const res = await api.get('/sla/escalations', { params });
    return res.data;
  },

  triggerCheck: async () => {
    const res = await api.post('/sla/check');
    return res.data.data;
  },
};

export const notificationService = {
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

export const feedbackService = {
  submitFeedback: async (data) => {
    const res = await api.post('/feedback', data);
    return res.data.data;
  },

  getFeedbackByTicket: async (ticketId) => {
    const res = await api.get(`/feedback/ticket/${ticketId}`);
    return res.data.data;
  },

  getAgentFeedback: async (agentId) => {
    const res = await api.get(`/feedback/agent/${agentId}`);
    return res.data.data;
  },
};

export const analyticsService = {
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },

  getLeaderboard: async () => {
    const res = await api.get('/analytics/agent-leaderboard');
    return res.data.data;
  },
};

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getAgents: async () => {
    const res = await api.get('/users/agents');
    return res.data.data;
  },

  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },

  toggleStatus: async (id, isActive) => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data.data;
  },
};

export { api, authService, ticketService };
