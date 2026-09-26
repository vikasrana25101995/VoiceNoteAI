import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const folderId = searchParams.get('folderId') || '';
  const tag = searchParams.get('tag') || '';

  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    let notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        folder: true,
      },
    });

    // Auto-seed initial note matching mockup if user has no notes yet
    if (notes.length === 0 && !search && !folderId && !tag) {
      try {
        const seedNote = await prisma.note.create({
          data: {
            title: 'Investor update — September',
            content: 'Revenue is up 18% month over month, which puts us slightly ahead of the plan we shared in July. Churn held flat at 2.1% — not moving, but not getting worse either.\n\nThe thing I keep coming back to is hiring. We need two more people on the transcription team before Q4 or the accuracy work slips into next year, and that pushes the enterprise conversations out with it.\n\nOn pricing: the team wants to test a usage-based tier for heavy voice users. I\'d rather wait until we have a full quarter of retention data on the current plans before we complicate the page.',
            summary: 'Growth is ahead of plan at 18% MoM with flat churn. The binding constraint is transcription hiring before Q4; a usage-based pricing test is proposed but deferred pending retention data.',
            bulletPoints: '• Open two transcription roles before Q4\n• Pull a full quarter of retention data\n• Hold the usage-based pricing test until October',
            actionItems: 'Open two transcription roles before Q4\nPull a full quarter of retention data\nHold the usage-based pricing test until October',
            tags: ['Work'],
            duration: 752,
            userId: user.id,
          },
          include: {
            folder: true,
          },
        });
        notes = [seedNote];
      } catch (seedErr) {
        console.warn('Seed note creation skipped:', seedErr);
      }
    }

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

  if (!title && title !== '') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        content: content || '',
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
