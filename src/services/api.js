import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Sanctum Bearer token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sanctum_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sanctum_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
