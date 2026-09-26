import { NextResponse } from 'next/server';
import { supabaseOAuth } from '@/lib/supabase';

// Starts Google sign-in: redirects the browser to Google via Supabase, which returns to /api/auth/callback.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await supabaseOAuth();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/api/auth/callback`, skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    console.error('Google OAuth start error:', error);
    return NextResponse.redirect(new URL('/login?error=google', origin));
  }
  return NextResponse.redirect(data.url);
}
