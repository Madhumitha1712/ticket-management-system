import api from './api';

export const ticketService = {
  getTickets: async (params = {}) => {
    const res = await api.get('/tickets', { params });
    return res.data;
  },

  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data.data;
  },

  createTicket: async (formData) => {
    const res = await api.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  assignTicket: async (id, agentId) => {
    const res = await api.patch(`/tickets/${id}/assign`, { agentId });
    return res.data.data;
  },

  updateStatus: async (id, status, reason = '') => {
    const res = await api.patch(`/tickets/${id}/status`, { status, reason });
    return res.data.data;
  },

  updatePriority: async (id, priority) => {
    const res = await api.patch(`/tickets/${id}/priority`, { priority });
    return res.data.data;
  },

  getComments: async (id) => {
    const res = await api.get(`/tickets/${id}/comments`);
    return res.data.data;
  },

  addComment: async (id, formData) => {
    const res = await api.post(`/tickets/${id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  getHistory: async (id) => {
    const res = await api.get(`/tickets/${id}/history`);
    return res.data.data;
  },
};
