import { LoginFormData, LoginResponse } from './types';

export class LoginService {
  async login(data: LoginFormData): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to sign in');
    }
    return result;
  }

  // Full-page redirect to Google; the promise never resolves so the button keeps its loading state.
  loginWithGoogle(): Promise<LoginResponse> {
    window.location.assign('/api/auth/google');
    return new Promise<LoginResponse>(() => {});
  }
}

export const loginService = new LoginService();
