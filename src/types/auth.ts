export type AuthResponse = {
  token: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
  newPassword: string;
};
