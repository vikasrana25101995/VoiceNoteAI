import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { isCompleted } = body;

  try {
    const user = await getOrCreateDefaultUser();

    const task = await prisma.task.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        isCompleted: isCompleted !== undefined ? isCompleted : task.isCompleted,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for PATCH /api/tasks/[id]');
    const updated = memoryDb.toggleTask(id, isCompleted);
    if (!updated) {
      return NextResponse.json({ error: 'Task not found in-memory' }, { status: 404 });
    }
    return NextResponse.json(updated);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getOrCreateDefaultUser();

    const task = await prisma.task.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for DELETE /api/tasks/[id]');
    const success = memoryDb.deleteTask(id);
    if (!success) {
      return NextResponse.json({ error: 'Task not found in-memory' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Task deleted successfully in-memory' });
  }
}
