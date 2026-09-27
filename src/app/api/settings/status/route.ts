import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Reports why the DB is unreachable (no credentials) so deploy issues can be diagnosed without server logs.
  let database = 'ok';
  try {
    await prisma.note.count();
  } catch (error) {
    database = error instanceof Error ? error.message.split('\n').slice(-3).join(' ').trim() : String(error);
  }

  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    database,
  });
}
