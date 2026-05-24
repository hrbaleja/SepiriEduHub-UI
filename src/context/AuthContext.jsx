import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService, { apiClient } from '../services';

const AuthContext = createContext(null);

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await ApiService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password);
      const { token: authToken, user: currentUser } = response;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(currentUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await ApiService.register(name, email, password);
      const { token: authToken, user: currentUser } = response;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(currentUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (name, email) => {
    try {
      const response = await ApiService.updateProfile(name, email);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Update failed'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await ApiService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await ApiService.forgotPassword(email);
      return { success: true, message: response.message || 'Check your email for reset instructions' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to request password reset'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await ApiService.resetPassword(token, password);
      return { success: true, message: response.message || 'Password reset successful' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reset password'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
