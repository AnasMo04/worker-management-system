import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await authService.getCurrentUser();
      const token = await authService.getToken();
      if (userData && token) {
        setUser(userData);
        const { initSocket } = require('../api/socket');
        initSocket(token);
      }
    } catch (e) {
      console.error('Failed to load login status');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    if (data.token) {
      const { initSocket } = require('../api/socket');
      initSocket(data.token);
    }
    return data;
  };

  const logout = async () => {
    const { disconnectSocket } = require('../api/socket');
    disconnectSocket();
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
