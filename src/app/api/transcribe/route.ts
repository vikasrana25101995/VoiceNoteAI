import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Save the audio file in public/audio/
    let audioUrl: string | null = null;
    try {
      const audioDir = path.join(process.cwd(), 'public', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const fileId = crypto.randomUUID();
      // Determine file extension
      let ext = 'webm';
      if (file.type.includes('mp4')) ext = 'mp4';
      else if (file.type.includes('wav')) ext = 'wav';
      else if (file.type.includes('ogg')) ext = 'ogg';

      const filename = `${fileId}.${ext}`;
      const filePath = path.join(audioDir, filename);
      fs.writeFileSync(filePath, buffer);
      audioUrl = `/audio/${filename}`;
    } catch (saveErr) {
      console.error('Failed to save audio file to public directory:', saveErr);
    }

    const customOpenAIKey = request.headers.get('x-openai-api-key') || undefined;
    const customGeminiKey = request.headers.get('x-gemini-api-key') || undefined;
    const text = await transcribeAudio(buffer, file.type, customOpenAIKey, customGeminiKey);

    return NextResponse.json({ text, audioUrl });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
