import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server-only client (service role key). New client per call so sessions never leak between requests.
export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Client for the OAuth (PKCE) round trip: only the code verifier is kept, in a short-lived httpOnly cookie.
// Our own voicenote_session cookie is the real session, so Supabase's session tokens are never stored.
export async function supabaseOAuth() {
  const store = await cookies();
  const isVerifier = (key: string) => key.endsWith('-code-verifier');
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => (isVerifier(key) ? store.get(key)?.value ?? null : null),
        setItem: (key, value) => {
          if (!isVerifier(key)) return;
          store.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 10 * 60,
          });
        },
        removeItem: (key) => {
          if (isVerifier(key)) store.delete(key);
        },
      },
    },
  });
}
