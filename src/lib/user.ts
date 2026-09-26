import { getSession } from './session';

export async function getOrCreateDefaultUser() {
  // First, check if there is an active logged-in user session
  try {
    const session = await getSession();
    if (session && session.userId) {
      return { id: session.userId, email: session.email, name: session.name ?? null };
    }
  } catch (err) {
    console.warn('Session check fallback in getOrCreateDefaultUser:', err);
  }

  // Fallback to default demo user for guest / unauthenticated dev access
  return { id: 'default-user-id', email: 'demo@voicenote.ai', name: 'Demo User' };
}
