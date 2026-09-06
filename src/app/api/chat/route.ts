import { NextResponse } from 'next/server';
import { chatWithNotes } from '@/lib/ai';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { memoryDb } from '@/lib/memoryDb';

export async function POST(request: Request) {
  const customOpenAIKey = request.headers.get('x-openai-api-key') || undefined;
  const customGeminiKey = request.headers.get('x-gemini-api-key') || undefined;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { query, noteId } = body;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  let notesContext: Array<{ title: string; content: string; summary: string | null }> = [];

  try {
    const user = await getOrCreateDefaultUser();

    if (noteId) {
      // Chat in context of a single note
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: user.id,
        },
        select: {
          title: true,
          content: true,
          summary: true,
        },
      });
      if (note) {
        notesContext = [note];
      }
    } else {
      // Chat in context of all notes
      notesContext = await prisma.note.findMany({
        where: {
          userId: user.id,
        },
        select: {
          title: true,
          content: true,
          summary: true,
        },
        take: 15, // limit context size
      });
    }

    if (notesContext.length === 0) {
      return NextResponse.json({
        response: "You don't have any notes yet! Record some notes first, and then I'll be happy to help answer questions about them.",
      });
    }

    const aiResponse = await chatWithNotes(query, notesContext, customOpenAIKey, customGeminiKey);

    // Record the message in database for logging (optional)
    try {
      await prisma.chatMessage.create({
        data: {
          query,
          response: aiResponse,
          userId: user.id,
          noteId: noteId || null,
        },
      });
    } catch (err) {
      console.error('Error saving chat message to db:', err);
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.warn('[Database Offline] Falling back to in-memory store for POST /api/chat');
    
    if (noteId) {
      const note = memoryDb.getNoteDetail(noteId);
      if (note) {
        notesContext = [{ title: note.title, content: note.content, summary: note.summary ?? null }];
      }
    } else {
      notesContext = memoryDb.getNotes().map(n => ({
        title: n.title,
        content: n.content,
        summary: n.summary ?? null,
      }));
    }

    if (notesContext.length === 0) {
      return NextResponse.json({
        response: "You don't have any notes yet! Record some notes first, and then I'll be happy to help answer questions about them.",
      });
    }

    const aiResponse = await chatWithNotes(query, notesContext, customOpenAIKey, customGeminiKey);
    return NextResponse.json({ response: aiResponse });
  }
}
