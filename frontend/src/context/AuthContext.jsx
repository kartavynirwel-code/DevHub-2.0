import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check for existing token on load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Token verification failed", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      localStorage.setItem('token', response.token);
      
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
      };
      setUser(userData);
      
      // Fetch full profile info in background to populate karma/bio
      try {
        const fullProfile = await api.getMe();
        setUser(fullProfile);
      } catch (e) {
        // Fallback to basic details
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      return await api.register(username, email, password);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
