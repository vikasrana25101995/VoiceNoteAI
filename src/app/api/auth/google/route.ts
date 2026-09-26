import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST() {
  try {
    // In production, exchange Google OAuth code / token for user info.
    // For local dev / demo experience, log in or create a demo Google user:
    const email = 'google.user@voicenote.ai';
    const name = 'Google User';

    // ponytail: demo stub, not real Google OAuth. Replace with supabase.auth.signInWithOAuth({ provider: 'google' }) + callback route.
    const user = { id: 'google-demo-user-id', email, name };

    await createSession(user.id, user.email, user.name);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Signed in with Google',
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error?.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
