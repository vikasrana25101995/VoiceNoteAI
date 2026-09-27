import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/user';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    console.error('Database error in GET /api/tasks:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { content, noteId, dueDate, assignee } = body;

  if (!content) {
    return NextResponse.json({ error: 'Task content is required' }, { status: 400 });
  }

  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const task = await prisma.task.create({
      data: {
        content,
        noteId: noteId || undefined,
        dueDate: dueDate || 'Today',
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Database error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
