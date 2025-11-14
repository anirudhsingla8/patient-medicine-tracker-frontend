import { create } from 'zustand';
import { clearStoredToken } from '../services/auth';

function getStoredToken(): string | null {
  return (
    localStorage.getItem('jwt_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('jwt_token') ||
    sessionStorage.getItem('token')
  );
}

function hasToken(): boolean {
  return !!getStoredToken();
}

type AuthState = {
  email: string | null;
  isAuthenticated: boolean;
  setEmail: (email: string | null) => void;
  refreshAuth: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  isAuthenticated: hasToken(),
  setEmail: (email) => set({ email }),
  refreshAuth: () => set({ isAuthenticated: hasToken() }),
  logout: () => {
    clearStoredToken();
    set({ email: null, isAuthenticated: false });
  },
}));
