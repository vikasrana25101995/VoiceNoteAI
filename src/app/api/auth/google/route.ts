import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST() {
  try {
    // In production, exchange Google OAuth code / token for user info.
    // For local dev / demo experience, log in or create a demo Google user:
    const email = 'google.user@voicenote.ai';
    const name = 'Google User';

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: 'https://lh3.googleusercontent.com/a/default-user',
        },
      });
    }

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
