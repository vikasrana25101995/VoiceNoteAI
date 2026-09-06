import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const folderId = searchParams.get('folderId') || '';
  const tag = searchParams.get('tag') || '';

  try {
    const user = await getOrCreateDefaultUser();

    // Build the dynamic Prisma query filter
    const whereClause: any = {
      userId: user.id,
    };

    if (folderId === 'unassigned') {
      whereClause.folderId = null;
    } else if (folderId) {
      whereClause.folderId = folderId;
    }

    if (tag) {
      whereClause.tags = {
        has: tag,
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        folder: true,
      },
    });

    return NextResponse.json(notes);
  } catch (error: any) {
    console.warn('[Database Offline] Falling back to in-memory store for GET /api/notes');
    const fallbackNotes = memoryDb.getNotes(search, folderId, tag);
    return NextResponse.json(fallbackNotes);
  }
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, content, summary, bulletPoints, actionItems, folderId, tags, duration } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  try {
    const user = await getOrCreateDefaultUser();
    const note = await prisma.note.create({
      data: {
        title,
        content,
        summary: summary || null,
        bulletPoints: bulletPoints || null,
        actionItems: actionItems || null,
        tags: tags || [],
        duration: duration || null,
        userId: user.id,
        folderId: folderId || null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    console.warn('[Database Offline] Falling back to in-memory store for POST /api/notes');
    const fallbackNote = memoryDb.createNote({
      title,
      content,
      summary,
      bulletPoints,
      actionItems,
      folderId,
      tags,
      duration,
    });
    return NextResponse.json(fallbackNote, { status: 201 });
  }
}
