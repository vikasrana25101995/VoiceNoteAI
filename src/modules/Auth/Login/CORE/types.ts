export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
  error?: string;
  message?: string;
}
