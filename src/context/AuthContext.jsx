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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking auth, token exists:', !!token);
    
    if (!token) {
      console.log('ℹ️ No token found, skipping auth check');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.getCurrentUser();
      console.log('✅ Auth check successful:', response.data.user);
      setUser(response.data.user);
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.register(userData);
      console.log('✅ Registration successful:', response.data.user);
      setUser(response.data.user);
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
      return response;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      const response = await api.login(credentials);
      console.log('✅ Login successful:', response.data.user);
      
      setUser(response.data.user);
      
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
      
      console.log('🔑 Token stored:', !!localStorage.getItem('token'));
      
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
  };

  const value = {
    user,
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