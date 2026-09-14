import { ResetPasswordFormData } from './types';
import { resetPasswordService } from './services';

export class ResetPasswordActions {
  validate(data: ResetPasswordFormData): string | null {
    if (!data.token) {
      return 'Invalid or missing reset token';
    }
    if (!data.password) {
      return 'Please enter a new password';
    }
    if (data.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (data.password !== data.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  async executeReset(data: ResetPasswordFormData) {
    const validationError = this.validate(data);
    if (validationError) {
      throw new Error(validationError);
    }
    return await resetPasswordService.resetPassword(data);
  }
}

export const resetPasswordActions = new ResetPasswordActions();
