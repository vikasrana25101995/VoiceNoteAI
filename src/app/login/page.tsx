import { Suspense } from 'react';
import LoginModule from '@/modules/Auth/Login';

export const metadata = {
  title: 'Sign In - VoiceNote AI',
  description: 'Sign in to VoiceNote AI to pick up where your last note left off.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <LoginModule />
    </Suspense>
  );
}
