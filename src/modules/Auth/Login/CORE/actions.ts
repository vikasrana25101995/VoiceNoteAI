import { LoginFormData } from './types';
import { loginService } from './services';

export class LoginActions {
  validate(data: LoginFormData): string | null {
    if (!data.email.trim()) {
      return 'Please enter your email address';
    }
    if (!data.email.includes('@') || !data.email.includes('.')) {
      return 'Please enter a valid email address';
    }
    if (!data.password) {
      return 'Please enter your password';
    }
    return null;
  }

  async executeLogin(data: LoginFormData) {
    const validationError = this.validate(data);
    if (validationError) {
      throw new Error(validationError);
    }
    return await loginService.login(data);
  }

  async executeGoogleLogin() {
    return await loginService.loginWithGoogle();
  }
}

export const loginActions = new LoginActions();
