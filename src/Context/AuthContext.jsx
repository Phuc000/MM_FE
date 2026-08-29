// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { useLocationContext } from "./LocationContext";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const locationContext = useLocationContext();

  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Function to handle login
  const login = (userData) => {
    setUser(userData);
  };

  const setLocation = locationContext?.setLocation;

  // Function to handle logout
  const logout = async () => {
    try {
      setUser(null);
      if (setLocation) setLocation(null);
      localStorage.removeItem("user");
      localStorage.removeItem("userLocation");
      localStorage.removeItem("storeRankings");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
