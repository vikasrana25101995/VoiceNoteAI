import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always respond with success to prevent email enumeration,
    // but only create token if user exists
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token,
          email: normalizedEmail,
          expiresAt,
        },
      });

      // In production, send email using SendGrid/Resend/Postmark etc.
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const resetUrl = `${origin}/reset-password?token=${token}`;
      console.log(`[Dev] Password reset URL for ${normalizedEmail}: ${resetUrl}`);

      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
        devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
      });
    }

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
