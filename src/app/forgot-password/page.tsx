import { Suspense } from 'react';
import ForgotPasswordModule from '@/modules/Auth/ForgotPassword';

export const metadata = {
  title: 'Forgot Password - VoiceNote AI',
  description: 'Request a password reset link for your VoiceNote AI account.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <ForgotPasswordModule />
    </Suspense>
  );
}
