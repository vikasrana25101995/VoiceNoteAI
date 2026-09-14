export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
  error?: string;
}
