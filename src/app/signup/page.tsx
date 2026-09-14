import { Suspense } from 'react';
import SignupModule from '@/modules/Auth/Signup';

export const metadata = {
  title: 'Create Account - VoiceNote AI',
  description: 'Create your account to start converting voice notes into clean editable text with VoiceNote AI.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <SignupModule />
    </Suspense>
  );
}
