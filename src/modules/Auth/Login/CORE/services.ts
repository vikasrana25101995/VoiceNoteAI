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

  async loginWithGoogle(): Promise<LoginResponse> {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to sign in with Google');
    }
    return result;
  }
}

export const loginService = new LoginService();
