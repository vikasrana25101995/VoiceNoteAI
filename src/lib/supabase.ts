import { createClient } from '@supabase/supabase-js';

// Server-only client (service role key). New client per call so sessions never leak between requests.
export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
