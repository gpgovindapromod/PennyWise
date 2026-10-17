import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic JWT injection interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pennywise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pennywise_token');
      localStorage.removeItem('pennywise_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
