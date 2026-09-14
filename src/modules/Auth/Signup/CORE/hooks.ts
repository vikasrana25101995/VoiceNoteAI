import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupFormData } from './types';
import { signupActions } from './actions';

export function useSignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const passwordStrength = signupActions.calculatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signupActions.executeSignup(formData);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      await signupActions.executeGoogleSignup();
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-up failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    isLoading,
    isGoogleLoading,
    errorMessage,
    passwordStrength,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
    handleGoogleSignIn,
  };
}
