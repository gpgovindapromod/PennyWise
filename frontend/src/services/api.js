import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    return url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`;
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000
});

// In-Memory Request Deduplication & Cache Store
const requestCache = new Map();
const inFlightRequests = new Map();

// Helper to determine if a GET endpoint is safe for short-lived caching
const isCacheable = (url) => {
  return (
    url.includes('/categories') ||
    url.includes('/dashboard/summary') ||
    url.includes('/travel/trips')
  );
};

// Invalidate cache on mutations
export const invalidateApiCache = (endpointKeyword) => {
  if (!endpointKeyword) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(endpointKeyword)) {
      requestCache.delete(key);
    }
  }
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pennywise_token') || sessionStorage.getItem('pennywise_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  // Deduplicate identical simultaneous GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
    config._cacheKey = cacheKey;

    // Check cached response (TTL: 15 seconds)
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 15000) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (Memory Cached)',
        headers: {},
        config
      });
      return config;
    }

    // Reuse in-flight promise if another component just requested the exact same endpoint
    if (inFlightRequests.has(cacheKey)) {
      config.adapter = () => inFlightRequests.get(cacheKey);
      return config;
    }
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (config?.method === 'get' && config?._cacheKey) {
      inFlightRequests.delete(config._cacheKey);
      if (isCacheable(config.url)) {
        requestCache.set(config._cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
    }

    // Clear related cache on mutations (POST, PUT, PATCH, DELETE)
    if (['post', 'put', 'patch', 'delete'].includes(config?.method)) {
      if (config.url.includes('/transactions')) {
        invalidateApiCache('/transactions');
        invalidateApiCache('/dashboard/summary');
      } else if (config.url.includes('/travel')) {
        invalidateApiCache('/travel');
      } else {
        requestCache.clear();
      }
    }

    return response;
  },
  (error) => {
    if (error.config?._cacheKey) {
      inFlightRequests.delete(error.config._cacheKey);
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pennywise_token');
      localStorage.removeItem('pennywise_user');
      sessionStorage.removeItem('pennywise_token');
      sessionStorage.removeItem('pennywise_user');
    }
    return Promise.reject(error);
  }
);

export default API;
