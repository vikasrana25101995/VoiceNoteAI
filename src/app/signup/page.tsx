import { redirect } from 'next/navigation';

// Signups are closed for now; restore the SignupModule page (see git history) to reopen.
export default function SignupPage() {
  redirect('/login');
}
