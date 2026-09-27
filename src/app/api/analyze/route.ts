import { NextResponse } from 'next/server';
import { analyzeTranscript, AIError } from '@/lib/ai';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/user';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { transcript, duration, audioUrl } = body;

  if (!transcript) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  // 1. Analyze transcript using AI
  const customOpenAIKey = request.headers.get('x-openai-api-key') || undefined;
  const customGeminiKey = request.headers.get('x-gemini-api-key') || undefined;
  let analysis;
  try {
    analysis = await analyzeTranscript(transcript, customOpenAIKey, customGeminiKey);
  } catch (error) {
    const status = error instanceof AIError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI analysis failed' }, { status });
  }

  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Find or create Folder (recommended category)
    let folderId: string | null = null;
    if (analysis.category) {
      try {
        const folder = await prisma.folder.upsert({
          where: {
            name_userId: {
              name: analysis.category,
              userId: user.id,
            },
          },
          update: {},
          create: {
            name: analysis.category,
            userId: user.id,
            color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          },
        });
        folderId = folder.id;
      } catch (err) {
        console.error('Error creating folder during analysis:', err);
      }
    }

    // 3. Create Note
    const note = await prisma.note.create({
      data: {
        title: analysis.title,
        content: transcript,
        summary: analysis.summary,
        bulletPoints: analysis.bulletPoints.join('\n'),
        actionItems: analysis.actionItems.join('\n'),
        tags: analysis.tags,
        duration: duration || null,
        audioUrl: audioUrl || null,
        userId: user.id,
        folderId: folderId,
      },
    });

    // 4. Create tasks extracted from the note
    const createdTasks = [];
    if (analysis.tasks && analysis.tasks.length > 0) {
      for (const task of analysis.tasks) {
        try {
          const newTask = await prisma.task.create({
            data: {
              content: task.content,
              dueDate: task.dueDate || null,
              noteId: note.id,
              userId: user.id,
            },
          });
          createdTasks.push(newTask);
        } catch (err) {
          console.error('Error creating task:', err);
        }
      }
    }

    return NextResponse.json({
      note,
      tasks: createdTasks,
      folderId,
      category: analysis.category,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Database error in POST /api/analyze:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
