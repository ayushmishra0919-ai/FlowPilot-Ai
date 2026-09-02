import axios from 'axios';

// Default production Vercel backend URL
export const DEFAULT_PRODUCTION_BACKEND_URL = 'https://flowpilot-ai-backend-7m6agqg3c-ayushmishra0919-6493s-projects.vercel.app';

/**
 * Dynamically resolves the API base URL.
 * 1. Checks localStorage for any user-configured custom backend URL.
 * 2. Checks VITE_API_BASE_URL (standard) or VITE_API_URL if provided.
 * 3. In deployed production environment (non-localhost), defaults to the live Vercel backend URL.
 * 4. In local development, defaults to '/api' (proxied by Vite dev server).
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const savedCustomUrl = localStorage.getItem('flowpilot_api_url');
    if (savedCustomUrl && savedCustomUrl.trim()) {
      const clean = savedCustomUrl.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

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

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      const clean = url.trim().replace(/\/+$/, '');
      localStorage.setItem('flowpilot_api_url', clean);
    } else {
      localStorage.removeItem('flowpilot_api_url');
    }
  }
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
    // Dynamically update baseURL if changed
    config.baseURL = getBaseUrl();

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
 * Health check helper function (checks /health, /api/health, and /)
 */
export const checkBackendHealth = async (customUrl = null) => {
  const targetBase = customUrl
    ? (customUrl.trim().replace(/\/+$/, '').endsWith('/api')
        ? customUrl.trim().replace(/\/+$/, '')
        : `${customUrl.trim().replace(/\/+$/, '')}/api`)
    : getBaseUrl();

  const client = axios.create({
    baseURL: targetBase,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000
  });

  try {
    const res = await client.get('/health');
    return { ok: true, data: res.data };
  } catch (err1) {
    try {
      const res2 = await client.get('/api/health');
      return { ok: true, data: res2.data };
    } catch (err2) {
      try {
        const rootUrl = targetBase.replace(/\/api$/, '');
        const res3 = await axios.get(`${rootUrl}/`, { timeout: 15000 });
        if (res3.data && (res3.data.status === 'HEALTHY' || res3.data.status === 'ONLINE')) {
          return { ok: true, data: res3.data };
        }
      } catch (err3) {}
      return { ok: false, error: err1.friendlyMessage || err1.message };
    }
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
  const currentBase = getBaseUrl();
  const cleanPath = webhookPath.startsWith('/') ? webhookPath : `/${webhookPath}`;
  if (currentBase.startsWith('http://') || currentBase.startsWith('https://')) {
    const rootBackendUrl = currentBase.replace(/\/api$/, '');
    return `${rootBackendUrl}${cleanPath}`;
  }
  return `${typeof window !== 'undefined' ? window.location.origin : ''}${cleanPath}`;
};

export default api;
