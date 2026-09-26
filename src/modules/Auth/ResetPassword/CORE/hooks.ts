import { useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordFormData } from './types';
import { resetPasswordActions } from './actions';

export function useResetPasswordForm() {
  const searchParams = useSearchParams();
  // Supabase recovery links put the token in the hash: #access_token=...&type=recovery
  const hash = useSyncExternalStore(() => () => {}, () => window.location.hash, () => '');
  const token = searchParams.get('token') || new URLSearchParams(hash.slice(1)).get('access_token') || '';

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    token,
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await resetPasswordActions.executeReset({ ...formData, token: token || formData.token });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    token,
    showPassword,
    isLoading,
    isSuccess,
    errorMessage,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
  };
}
