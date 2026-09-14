import { useState } from 'react';
import { ForgotPasswordFormData } from './types';
import { forgotPasswordActions } from './actions';

export function useForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await forgotPasswordActions.executeResetRequest({ email });
      setIsSubmitted(true);
      if (response.devResetUrl) {
        setDevResetUrl(response.devResetUrl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return {
    email,
    setEmail,
    isLoading,
    isSubmitted,
    errorMessage,
    devResetUrl,
    handleSubmit,
    handleResend,
  };
}
