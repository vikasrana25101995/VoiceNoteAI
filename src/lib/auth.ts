import { getSession } from './session';

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    return {
      id: session.userId,
      email: session.email,
      name: session.name ?? null,
      image: session.image ?? null,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
