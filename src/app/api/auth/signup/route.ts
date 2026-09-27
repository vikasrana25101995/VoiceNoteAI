import { NextResponse } from 'next/server';

// Signups are closed for now; restore the previous handler from git history to reopen.
export async function POST() {
  return NextResponse.json({ error: 'Signups are currently closed' }, { status: 403 });
}
