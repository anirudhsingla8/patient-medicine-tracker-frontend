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

export function extractErrorMessage(error: unknown): string {
  try {
    const anyErr = error as any;
    if (anyErr?.response) {
      const data = anyErr.response.data;
      if (typeof data === 'string') return data;
      if (typeof data?.message === 'string' && data.message) return data.message;
      if (typeof data?.error === 'string' && data.error) return data.error;
      if (Array.isArray(data?.errors) && data.errors.length) {
        const first = data.errors[0];
        if (typeof first === 'string') return first;
        if (typeof (first as any)?.message === 'string') return (first as any).message;
      }
      if (Array.isArray(data?.details) && data.details.length) {
        const first = data.details[0];
        if (typeof first === 'string') return first;
        if (typeof (first as any)?.message === 'string') return (first as any).message;
      }
    }
    if ((anyErr as any)?.message) return (anyErr as any).message as string;
  } catch {}
  return 'Something went wrong. Please try again.';
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
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

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
    }

    // Always reject so callers can display messages via extractErrorMessage
    return Promise.reject(error);
  }
);
