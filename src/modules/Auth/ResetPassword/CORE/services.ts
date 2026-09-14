import { ResetPasswordFormData, ResetPasswordResponse } from './types';

export class ResetPasswordService {
  async resetPassword(data: ResetPasswordFormData): Promise<ResetPasswordResponse> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        password: data.password,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to reset password');
    }
    return result;
  }
}

export const resetPasswordService = new ResetPasswordService();
