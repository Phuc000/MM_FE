// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useTimer } from './TimerContext';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const { resetTimer } = useTimer();

  // Update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Function to handle login
  const login = (userData) => {
    setUser(userData);
  };

  // Function to handle logout
  const logout = () => {
    resetTimer();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};