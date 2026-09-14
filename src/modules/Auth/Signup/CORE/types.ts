export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface SignupResponse {
  success?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
  error?: string;
  message?: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
