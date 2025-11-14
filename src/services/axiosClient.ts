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
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Basic 401 handling: clear tokens so UI reacts (ProtectedRoute) and let the request fail
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens();
      // Do not force redirect here; ProtectedRoute will handle redirect on next render
    }
    return Promise.reject(error);
  }
);
