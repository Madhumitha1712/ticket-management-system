import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
export const cleanBaseUrl = rawBaseUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: cleanBaseUrl ? `${cleanBaseUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return cleanBaseUrl ? `${cleanBaseUrl}${cleanPath}` : cleanPath;
};

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fsd_ticket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized / token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('fsd_ticket_token');
      localStorage.removeItem('fsd_ticket_user');
      
      // If not already on login page, redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
