import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/user';

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
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    console.error('Database error in PATCH /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    console.error('Database error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
