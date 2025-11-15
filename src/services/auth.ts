import { axiosClient } from './axiosClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
} from '../types/auth';

function storeToken(token: string, remember = true) {
  if (remember) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('token', token);
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('jwt_token', token);
    sessionStorage.setItem('token', token);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token');
  }
}

export function clearStoredToken() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('jwt_token');
  sessionStorage.removeItem('token');
}

export async function login(
  payload: LoginRequest,
  options?: { remember?: boolean }
): Promise<AuthResponse> {
  const res = await axiosClient.post<AuthResponse>('/api/auth/login', payload);
  storeToken(res.data.token, options?.remember ?? true);
  return res.data;
}

export async function register(
  payload: RegisterRequest,
  options?: { remember?: boolean }
): Promise<AuthResponse> {
  const res = await axiosClient.post<AuthResponse>('/api/auth/register', payload);
  storeToken(res.data.token, options?.remember ?? true);
  return res.data;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
  _options?: { remember?: boolean }
): Promise<AuthResponse> {
  const res = await axiosClient.post<AuthResponse>('/api/auth/forgot-password', payload);
  // Do NOT auto-login after password reset; user must sign in manually.
  return res.data;
}

export function logout() {
  // No explicit logout endpoint exposed; clear token locally
  clearStoredToken();
}

export async function updateFcmToken(fcmToken: string): Promise<void> {
  await axiosClient.post('/api/users/fcm-token', { fcmToken });
}

export async function getHealth(): Promise<any> {
  // Backend exposes health at GET /
  const res = await axiosClient.get('/');
  return res.data;
}
