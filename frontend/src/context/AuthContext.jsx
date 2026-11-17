import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('campus_bikepool_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_bikepool_token'));
  const [loading, setLoading] = useState(true);

  // Sync state and check validity on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campus_bikepool_token');
      if (storedToken) {
        try {
          const { data } = await axiosClient.get('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('campus_bikepool_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('campus_bikepool_token', data.token);
      localStorage.setItem('campus_bikepool_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (formData) => {
    const { data } = await axiosClient.post('/auth/register', formData);
    if (data.token) {
      localStorage.setItem('campus_bikepool_token', data.token);
      localStorage.setItem('campus_bikepool_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('campus_bikepool_token');
    localStorage.removeItem('campus_bikepool_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
