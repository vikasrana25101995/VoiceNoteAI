import { SignupFormData, PasswordStrength } from './types';
import { signupService } from './services';

export class SignupActions {
  validate(data: SignupFormData): string | null {
    if (!data.fullName.trim()) {
      return 'Please enter your full name';
    }
    if (!data.email.trim()) {
      return 'Please enter your email address';
    }
    if (!data.email.includes('@') || !data.email.includes('.')) {
      return 'Please enter a valid email address';
    }
    if (!data.password) {
      return 'Please enter a password';
    }
    if (data.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!data.agreeToTerms) {
      return 'You must agree to the Terms of Service and Privacy Policy';
    }
    return null;
  }

  calculatePasswordStrength(password: string): { score: number; level: PasswordStrength } {
    if (!password) return { score: 0, level: 'weak' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let level: PasswordStrength = 'weak';
    if (score >= 3) level = 'strong';
    else if (score >= 2) level = 'medium';

    return { score, level };
  }

  async executeSignup(data: SignupFormData) {
    const validationError = this.validate(data);
    if (validationError) {
      throw new Error(validationError);
    }
    return await signupService.signup(data);
  }

  async executeGoogleSignup() {
    return await signupService.loginWithGoogle();
  }
}

export const signupActions = new SignupActions();
