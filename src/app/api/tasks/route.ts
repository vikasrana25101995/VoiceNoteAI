import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
      },
      include: {
        note: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for GET /api/tasks');
    const fallbackTasks = memoryDb.getTasks();
    return NextResponse.json(fallbackTasks);
  }
}
