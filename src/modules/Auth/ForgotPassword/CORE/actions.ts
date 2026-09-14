import { ForgotPasswordFormData } from './types';
import { forgotPasswordService } from './services';

export class ForgotPasswordActions {
  validate(data: ForgotPasswordFormData): string | null {
    if (!data.email.trim()) {
      return 'Please enter your email address';
    }
    if (!data.email.includes('@') || !data.email.includes('.')) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  async executeResetRequest(data: ForgotPasswordFormData) {
    const validationError = this.validate(data);
    if (validationError) {
      throw new Error(validationError);
    }
    return await forgotPasswordService.requestReset(data);
  }
}

export const forgotPasswordActions = new ForgotPasswordActions();
