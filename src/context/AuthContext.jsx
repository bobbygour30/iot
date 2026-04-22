// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        api.setToken(token);
        const response = await api.getCurrentUser();
        setUser(response.data.user);
        setZone(response.data.zone);
        // Store role in localStorage for quick access
        if (response.data.user?.role) {
          localStorage.setItem('userRole', response.data.user.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        api.setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.register(userData);
      setUser(response.data.user);
      setZone(response.data.zone);
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.login(credentials);
      setUser(response.data.user);
      setZone(response.data.zone);
      // Store role in localStorage for quick access
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setZone(null);
      api.setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
  };

  const value = {
    user,
    zone,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};