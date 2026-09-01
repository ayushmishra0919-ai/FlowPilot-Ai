import axios from 'axios';

// Default production Vercel backend URL
export const DEFAULT_PRODUCTION_BACKEND_URL = 'https://flowpilot-ai-backend-7m6agqg3c-ayushmishra0919-6493s-projects.vercel.app';

/**
 * Dynamically resolves the API base URL.
 * 1. Checks VITE_API_BASE_URL (standard) or VITE_API_URL if provided.
 * 2. In deployed production environment (non-localhost), automatically routes to the live Vercel backend URL.
 * 3. In local development, defaults to '/api' (proxied by Vite dev server to localhost:5000).
 */
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // If running in a deployed browser (e.g. *.vercel.app, custom domain), use the live Vercel backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return `${DEFAULT_PRODUCTION_BACKEND_URL}/api`;
  }

  return '/api';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30s timeout for serverless / AI processing
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
