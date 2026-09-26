import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Supabase emails a link to /reset-password#access_token=...&type=recovery
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const { error } = await supabaseAdmin().auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) console.error('Supabase resetPasswordForEmail error:', error);

    // Always respond with success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
