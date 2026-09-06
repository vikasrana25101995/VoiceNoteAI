import { prisma } from './db';

export async function getOrCreateDefaultUser() {
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
        // Catch P2002 Unique Constraint violation error, which can happen if
        // concurrent API requests try to create the default user at the same time.
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
    // Return a fallback mock user object if database is not connected yet, to prevent app crashing
    return {
      id: 'default-user-id',
      email,
      name: 'Demo User',
      passwordHash: 'demo-password-hash',
    };
  }
}
