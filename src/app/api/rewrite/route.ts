import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import OpenAI from 'openai';

async function rewriteWithGemini(noteContent: string, prompt: string, apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `Rewrite the text according to this instruction. Return only the rewritten text.\n\nInstruction: ${prompt}\n\nOriginal Text:\n"${noteContent}"` }] }] }),
  });
  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || '';
    } catch {
      // response wasn't JSON; ignore
    }
    throw new Error(`Gemini API request failed (${response.status})${detail ? `: ${detail}` : '.'}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '';
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await request.json();
    const { noteId, mode, prompt } = body;

    if (!noteId || !mode || !prompt) {
      return NextResponse.json({ error: 'noteId, mode, and prompt are required' }, { status: 400 });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const customApiKey = request.headers.get('x-openai-api-key') || undefined;
    const geminiKey = request.headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      const rewrittenText = await rewriteWithGemini(note.content, prompt, geminiKey);
      return NextResponse.json({ rewrittenText });
    }

    const apiKey = customApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API Key not found. Please add your key in the Settings panel (at the bottom left of the sidebar).' }, { status: 400 });
    }

    let rewrittenText = '';
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional editor. Rewrite the text according to the instructions provided.',
        },
        {
          role: 'user',
          content: `Instruction: ${prompt}\n\nOriginal Text:\n"${note.content}"`,
        },
      ],
    });
    rewrittenText = response.choices[0]?.message?.content || '';

    return NextResponse.json({ rewrittenText });
  } catch (error: any) {
    console.error('Rewrite API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rewrite note' },
      { status: 500 }
    );
  }
}
