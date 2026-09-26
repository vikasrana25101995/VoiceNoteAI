import { SignupFormData, SignupResponse } from './types';

export class SignupService {
  async signup(data: SignupFormData): Promise<SignupResponse> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreeToTerms,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create account');
    }
    return result;
  }

  // Full-page redirect to Google; the promise never resolves so the button keeps its loading state.
  loginWithGoogle(): Promise<SignupResponse> {
    window.location.assign('/api/auth/google');
    return new Promise<SignupResponse>(() => {});
  }
}

export const signupService = new SignupService();
