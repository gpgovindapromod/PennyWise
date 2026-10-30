import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

// Detect mobile devices (phones, tablets, PWAs)
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 840px)').matches ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};

// Storage keys: Permanent on mobile (localStorage), session-based on desktop (sessionStorage)
const getStoredToken = () => {
  if (isMobileDevice()) {
    return localStorage.getItem('pennywise_token');
  }
  return sessionStorage.getItem('pennywise_token') || localStorage.getItem('pennywise_token');
};

const getStoredUser = () => {
  try {
    const raw = isMobileDevice()
      ? localStorage.getItem('pennywise_user')
      : (sessionStorage.getItem('pennywise_user') || localStorage.getItem('pennywise_user'));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveCredentials = (token, user) => {
  if (isMobileDevice()) {
    // Persistent login on mobile
    localStorage.setItem('pennywise_token', token);
    localStorage.setItem('pennywise_user', JSON.stringify(user));
  } else {
    // Desktop: session-scoped (expires when browser/tab closes)
    sessionStorage.setItem('pennywise_token', token);
    sessionStorage.setItem('pennywise_user', JSON.stringify(user));
    // Clear any previous persistent desktop token
    localStorage.removeItem('pennywise_token');
    localStorage.removeItem('pennywise_user');
  }
};

const clearCredentials = () => {
  localStorage.removeItem('pennywise_token');
  localStorage.removeItem('pennywise_user');
  sessionStorage.removeItem('pennywise_token');
  sessionStorage.removeItem('pennywise_user');
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  // If user is already cached, start non-blocking (loading = false)
  const [loading, setLoading] = useState(() => {
    return !!getStoredToken() && !getStoredUser();
  });

  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then((res) => {
          const freshUser = res.data.data.user;
          setUser(freshUser);
          saveCredentials(token, freshUser);
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
    saveCredentials(data.token, data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearCredentials();
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      if (token) saveCredentials(token, merged);
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isMobile: isMobileDevice() }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);