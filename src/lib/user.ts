import { getSession } from './session';

// Logged-in user from the session cookie, or null. Routes must 401 on null.
export async function requireUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, email: session.email, name: session.name ?? null };
}
