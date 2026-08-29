import axios from 'axios';

// Dynamically determine API baseURL:
// 1. If VITE_API_URL is provided in environment variables, use it.
// 2. Otherwise default to '/api' for same-domain proxying/rewrites in production and Vite dev.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('flowpilot_token');
      localStorage.removeItem('flowpilot_user');
    }
    return Promise.reject(error);
  }
);

export default api;
