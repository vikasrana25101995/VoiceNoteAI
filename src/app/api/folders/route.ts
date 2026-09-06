import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();

    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for GET /api/folders');
    const fallbackFolders = memoryDb.getFolders();
    return NextResponse.json(fallbackFolders);
  }
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, color } = body;

  if (!name) {
    return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
  }

  try {
    const user = await getOrCreateDefaultUser();

    const folder = await prisma.folder.upsert({
      where: {
        name_userId: {
          name,
          userId: user.id,
        },
      },
      update: {
        color: color || undefined,
      },
      create: {
        name,
        color: color || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        userId: user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory store for POST /api/folders');
    const fallbackFolder = memoryDb.createFolder(name, color);
    return NextResponse.json(fallbackFolder, { status: 201 });
  }
}
