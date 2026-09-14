import { prisma } from './db';
import { getSession } from './session';

export async function getOrCreateDefaultUser() {
  // First, check if there is an active logged-in user session
  try {
    const session = await getSession();
    if (session && session.userId) {
      const loggedInUser = await prisma.user.findUnique({
        where: { id: session.userId },
      });
      if (loggedInUser) {
        return loggedInUser;
      }
    }
  } catch (err) {
    console.warn('Session check fallback in getOrCreateDefaultUser:', err);
  }

  // Fallback to default demo user for guest / unauthenticated dev access
  const email = 'demo@voicenote.ai';
  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: 'default-user-id',
            email,
            name: 'Demo User',
            passwordHash: 'demo-password-hash',
          },
        });
      } catch (createError: any) {
        if (createError && (createError.code === 'P2002' || createError.message?.includes('UniqueConstraintViolation'))) {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } else {
          throw createError;
        }
      }
    }

    if (!user) {
      throw new Error('Failed to retrieve or create default user');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting or creating default user:', error);
    return {
      id: 'default-user-id',
      email,
      name: 'Demo User',
      passwordHash: 'demo-password-hash',
    };
  }
}
