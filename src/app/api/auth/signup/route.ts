import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, agreeToTerms } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (agreeToTerms !== undefined && !agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the Terms of Service and Privacy Policy' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const trimmedName = name ? name.trim() : null;

    // email_confirm: true keeps the current "sign up and go straight in" flow (no verification email)
    const { data, error } = await supabaseAdmin().auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: trimmedName },
    });

    if (error) {
      if (error.code === 'email_exists' || error.status === 422) {
        return NextResponse.json(
          { error: 'An account with this email address already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    const user = {
      id: data.user.id,
      email: normalizedEmail,
      name: trimmedName,
      createdAt: data.user.created_at,
    };

    // Create session cookie
    await createSession(user.id, user.email, user.name);

    return NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred during account creation' },
      { status: 500 }
    );
  }
}
