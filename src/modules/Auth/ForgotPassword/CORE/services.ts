import { ForgotPasswordFormData, ForgotPasswordResponse } from './types';

export class ForgotPasswordService {
  async requestReset(data: ForgotPasswordFormData): Promise<ForgotPasswordResponse> {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to request password reset');
    }
    return result;
  }
}

export const forgotPasswordService = new ForgotPasswordService();
