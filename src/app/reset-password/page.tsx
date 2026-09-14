import { Suspense } from 'react';
import ResetPasswordModule from '@/modules/Auth/ResetPassword';

export const metadata = {
  title: 'Reset Password - VoiceNote AI',
  description: 'Set a new password for your VoiceNote AI account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <ResetPasswordModule />
    </Suspense>
  );
}
