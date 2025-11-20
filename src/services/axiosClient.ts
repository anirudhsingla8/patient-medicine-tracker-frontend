import axios from 'axios';

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';

function getStoredToken(): string | null {
  return (
    localStorage.getItem('jwt_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('jwt_token') ||
    sessionStorage.getItem('token')
  );
}

function clearTokens() {
  try {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('token');
  } catch {
    // no-op
  }
}

export const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

import { eventBus } from '../utils/eventBus';
import { extractErrorMessage } from '../utils/errorUtils';

// Global error handling: normalize errors and handle auth failures
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearTokens();
      // Redirect to login with a message if not already there
      if (typeof window !== 'undefined') {
        const isOnLogin = window.location.pathname.startsWith('/login');
        if (!isOnLogin) {
          const url = new URL(window.location.href);
          const from = url.pathname + url.search + url.hash;
          const params = new URLSearchParams({ msg: 'session_expired', from });
          window.location.assign(`/login?${params.toString()}`);
        }
      }
    } else {
      // Trigger global error snackbar for other errors (400, 404, 500, etc.)
      // We avoid triggering it for 401/403 as the redirect handles it (or we could show a message too)
      const message = extractErrorMessage(error);
      eventBus.emit('error', message);
    }

    return Promise.reject(error);
  }
);
