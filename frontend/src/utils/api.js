import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedBaseUrl = (() => {
  if (!configuredBaseUrl) return '/api';
  const clean = configuredBaseUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
})();

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gc_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
