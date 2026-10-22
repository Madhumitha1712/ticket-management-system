import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fsd_ticket_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fsd_ticket_token');
      if (storedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('fsd_ticket_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          localStorage.removeItem('fsd_ticket_token');
          localStorage.removeItem('fsd_ticket_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      const { user: userData, token: jwtToken } = res.data;
      
      localStorage.setItem('fsd_ticket_token', jwtToken);
      localStorage.setItem('fsd_ticket_user', JSON.stringify(userData));
      
      setUser(userData);
      setToken(jwtToken);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      const { user: registeredUser, token: jwtToken } = res.data;

      localStorage.setItem('fsd_ticket_token', jwtToken);
      localStorage.setItem('fsd_ticket_user', JSON.stringify(registeredUser));

      setUser(registeredUser);
      setToken(jwtToken);
      return registeredUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('fsd_ticket_token');
    localStorage.removeItem('fsd_ticket_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      localStorage.setItem('fsd_ticket_user', JSON.stringify(updated));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      throw new Error(msg);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    isAgent: user?.role === 'AGENT',
    isEmployee: user?.role === 'EMPLOYEE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
