export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
  error?: string;
  devResetUrl?: string;
}
