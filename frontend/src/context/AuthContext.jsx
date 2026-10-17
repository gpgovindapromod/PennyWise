import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('pennywise_token'));
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('pennywise_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!localStorage.getItem('pennywise_user'));

  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then((res) => {
          setUser(res.data.data.user);
          localStorage.setItem('pennywise_user', JSON.stringify(res.data.data.user));
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            logout();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (data) => {
    setUser(data);
    setToken(data.token);
    localStorage.setItem('pennywise_token', data.token);
    localStorage.setItem('pennywise_user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pennywise_token');
    localStorage.removeItem('pennywise_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('pennywise_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);