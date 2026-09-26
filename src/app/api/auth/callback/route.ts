import { NextResponse } from 'next/server';
import { supabaseOAuth } from '@/lib/supabase';
import { createSession } from '@/lib/session';

// Google (via Supabase) redirects here with ?code=... ; exchange it and set our session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const failed = NextResponse.redirect(new URL('/login?error=google', origin));

  if (!code) return failed;

  const supabase = await supabaseOAuth();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    console.error('Google OAuth callback error:', error);
    return failed;
  }

  const meta = data.user.user_metadata ?? {};
  await createSession(
    data.user.id,
    data.user.email,
    meta.full_name ?? meta.name ?? null,
    meta.avatar_url ?? meta.picture ?? null
  );
  return NextResponse.redirect(new URL('/', origin));
}
