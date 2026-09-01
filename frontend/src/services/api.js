import axios from 'axios';

/**
 * Dynamically resolves the API base URL.
 * Checks VITE_API_BASE_URL (standard), VITE_API_URL, or defaults to '/api' for relative proxying.
 */
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  // If the base URL already ends with /api, use it; otherwise append /api
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30s timeout for AI generation / serverless cold start
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
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Unauthorized status
    if (error.response?.status === 401) {
      localStorage.removeItem('flowpilot_token');
      localStorage.removeItem('flowpilot_user');
    }

    // Extract user-friendly error message
    const friendlyMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. The server might be waking up from cold start.' : null) ||
      (error.message === 'Network Error' ? 'Unable to connect to FlowPilot backend server. Please check your network or backend URL.' : error.message) ||
      'An unexpected error occurred while communicating with the server.';

    error.friendlyMessage = friendlyMessage;

    return Promise.reject(error);
  }
);

/**
 * Health check helper function
 */
export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/health');
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.friendlyMessage || err.message };
  }
};

/**
 * Full Webhook URL resolver for external copy and cURL triggers
 */
export const getFullWebhookUrl = (webhookPath) => {
  if (!webhookPath) return '';
  if (webhookPath.startsWith('http://') || webhookPath.startsWith('https://')) {
    return webhookPath;
  }
  const cleanPath = webhookPath.startsWith('/') ? webhookPath : `/${webhookPath}`;
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    const rootBackendUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${rootBackendUrl}${cleanPath}`;
  }
  return `${typeof window !== 'undefined' ? window.location.origin : ''}${cleanPath}`;
};

export default api;
