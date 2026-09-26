import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

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
    console.warn('[Database Offline] Falling back to in-memory store for GET /api/tasks');
    const fallbackTasks = memoryDb.getTasks();
    return NextResponse.json(fallbackTasks);
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
    console.warn('[Database Offline] Falling back to in-memory store for POST /api/tasks');
    const newTask = memoryDb.createTask(content, noteId || 'note-1', dueDate ? new Date() : undefined);
    if (assignee) {
      newTask.assignee = assignee;
    }
    if (dueDate) {
      newTask.dueDate = dueDate;
    }
    return NextResponse.json(newTask, { status: 201 });
  }
}
