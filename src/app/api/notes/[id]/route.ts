import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getOrCreateDefaultUser();

    const note = await prisma.note.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        folder: true,
        tasks: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for GET /api/notes/[id]');
    const fallbackNote = memoryDb.getNoteDetail(id);
    if (!fallbackNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(fallbackNote);
  }
}

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

  const { title, content, summary, bulletPoints, actionItems, folderId, tags } = body;

  try {
    const user = await getOrCreateDefaultUser();

    const note = await prisma.note.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : note.title,
        content: content !== undefined ? content : note.content,
        summary: summary !== undefined ? summary : note.summary,
        bulletPoints: bulletPoints !== undefined ? bulletPoints : note.bulletPoints,
        actionItems: actionItems !== undefined ? actionItems : note.actionItems,
        tags: tags !== undefined ? tags : note.tags,
        folderId: folderId !== undefined ? (folderId === 'unassigned' ? null : folderId) : note.folderId,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for PATCH /api/notes/[id]');
    const updated = memoryDb.updateNote(id, {
      title,
      content,
      summary,
      bulletPoints,
      actionItems,
      tags,
      folderId,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Note not found in-memory' }, { status: 404 });
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

    const note = await prisma.note.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for DELETE /api/notes/[id]');
    const success = memoryDb.deleteNote(id);
    if (!success) {
      return NextResponse.json({ error: 'Note not found in-memory' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Note deleted successfully in-memory' });
  }
}
