import OpenAI from 'openai';

interface AIAnalysisResult {
  title: string;
  summary: string;
  bulletPoints: string[];
  actionItems: string[];
  category: string;
  tags: string[];
  tasks: Array<{ content: string; dueDate?: Date }>;
}

const getOpenAIClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

const getGeminiApiKey = (customApiKey?: string) =>
  customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function generateGeminiContent(
  contents: unknown,
  customApiKey?: string,
  generationConfig?: Record<string, unknown>
): Promise<string> {
  const apiKey = getGeminiApiKey(customApiKey);
  if (!apiKey) {
    throw new Error('Google Gemini API Key not found. Please add your key in the Settings panel (at the bottom left of the sidebar).');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    }
  );

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

/**
 * Transcribes audio file buffer to text using Whisper.
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string, customOpenAIKey?: string, customGeminiKey?: string): Promise<string> {
  const geminiKey = getGeminiApiKey(customGeminiKey);
  if (geminiKey) {
    try {
      return await generateGeminiContent([
        {
          role: 'user',
          parts: [
            { text: 'Transcribe this audio exactly. Return only the transcription.' },
            { inlineData: { mimeType, data: audioBuffer.toString('base64') } },
          ],
        },
      ], geminiKey);
    } catch (error) {
      console.error('Error in Gemini transcription:', error);
      throw new Error(`Failed to transcribe audio with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const openai = getOpenAIClient(customOpenAIKey);
  if (!openai) {
    throw new Error('OpenAI API Key not found. Please add your key in the Settings panel (at the bottom left of the sidebar).');
  }

  try {
    let filename = 'recording.webm';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
      filename = 'recording.mp4';
    } else if (mimeType.includes('wav')) {
      filename = 'recording.wav';
    } else if (mimeType.includes('ogg')) {
      filename = 'recording.ogg';
    }

    const file = new File([new Uint8Array(audioBuffer)], filename, { type: mimeType });
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });
    return transcription.text;
  } catch (error) {
    console.error('Error in Whisper transcription:', error);
    throw new Error('Failed to transcribe audio.');
  }
}

/**
 * Analyzes note text to generate summaries, bullet points, tasks, and categorization.
 */
export async function analyzeTranscript(text: string, customOpenAIKey?: string, customGeminiKey?: string): Promise<AIAnalysisResult> {
  const geminiKey = getGeminiApiKey(customGeminiKey);
  const prompt = `
You are an expert AI productivity assistant. Analyze the following transcript text and extract:
1. A concise, professional title.
2. A summary paragraph (2-3 sentences).
3. A list of 3-5 core bullet points capturing key takeaways.
4. A list of specific action items.
5. A recommended category folder (choose ONE from: Work, Meetings, Ideas, Journal, Study, Personal, Project).
6. A list of 2-4 tag keywords.
7. A list of structured task items with optional due dates (if mentioned in text, format date as YYYY-MM-DD, otherwise omit due date).

Return ONLY valid JSON matching this schema:
{"title":"string","summary":"string","bulletPoints":["string"],"actionItems":["string"],"category":"string","tags":["string"],"tasks":[{"content":"string","dueDate":"string | null"}]}

Transcript:
"${text}"
`;

  if (geminiKey) {
    try {
      const resultText = await generateGeminiContent([{ role: 'user', parts: [{ text: prompt }] }], geminiKey, {
        responseMimeType: 'application/json',
      });
      const parsed = JSON.parse(resultText);
      return {
        title: parsed.title || 'Untitled Note', summary: parsed.summary || '',
        bulletPoints: parsed.bulletPoints || [], actionItems: parsed.actionItems || [],
        category: parsed.category || 'Personal', tags: parsed.tags || [],
        tasks: (parsed.tasks || []).map((t: any) => ({ content: t.content, dueDate: t.dueDate ? new Date(t.dueDate) : undefined })),
      };
    } catch (error) {
      console.error('Error in Gemini analysis:', error);
      throw new Error(`Failed to analyze note transcript with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const openai = getOpenAIClient(customOpenAIKey);

  if (!openai) {
    throw new Error('OpenAI API Key not found. Please add your key in the Settings panel (at the bottom left of the sidebar).');
  }

  try {
    const prompt = `
You are an expert AI productivity assistant. Analyze the following transcript text and extract:
1. A concise, professional title.
2. A summary paragraph (2-3 sentences).
3. A list of 3-5 core bullet points capturing key takeaways.
4. A list of specific action items.
5. A recommended category folder (choose ONE from: Work, Meetings, Ideas, Journal, Study, Personal, Project).
6. A list of 2-4 tag keywords.
7. A list of structured task items with optional due dates (if mentioned in text, format date as YYYY-MM-DD, otherwise omit due date).

Return the output ONLY as a valid JSON object matching this schema:
{
  "title": "string",
  "summary": "string",
  "bulletPoints": ["string"],
  "actionItems": ["string"],
  "category": "string",
  "tags": ["string"],
  "tasks": [{"content": "string", "dueDate": "string | null"}]
}

Transcript:
"${text}"
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(resultText);

    return {
      title: parsed.title || 'Untitled Note',
      summary: parsed.summary || '',
      bulletPoints: parsed.bulletPoints || [],
      actionItems: parsed.actionItems || [],
      category: parsed.category || 'Personal',
      tags: parsed.tags || [],
      tasks: (parsed.tasks || []).map((t: any) => ({
        content: t.content,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      })),
    };
  } catch (error) {
    console.error('Error in OpenAI GPT analysis:', error);
    throw new Error('Failed to analyze note transcript.');
  }
}

/**
 * Chat with notes content.
 */
export async function chatWithNotes(
  query: string,
  notesContext: Array<{ title: string; content: string; summary?: string | null }>,
  customOpenAIKey?: string,
  customGeminiKey?: string
): Promise<string> {
  const geminiKey = getGeminiApiKey(customGeminiKey);

  if (geminiKey) {
    const contextString = notesContext
      .map((n, idx) => `[Note #${idx + 1}] Title: ${n.title}\nSummary: ${n.summary || 'N/A'}\nContent: ${n.content}`)
      .join('\n\n');
    try {
      return await generateGeminiContent([{ role: 'user', parts: [{ text: `Answer the user's question based only on these notes. Be concise and professional.\n\nNotes:\n${contextString}\n\nUser Query: "${query}"` }] }], geminiKey);
    } catch (error) {
      console.error('Error in Gemini Chat:', error);
      throw new Error(`Failed to communicate with Gemini chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const openai = getOpenAIClient(customOpenAIKey);
  if (!openai) {
    throw new Error('OpenAI API Key not found. Please add your key in the Settings panel (at the bottom left of the sidebar).');
  }

  try {
    const contextString = notesContext
      .map((n, idx) => `[Note #${idx + 1}] Title: ${n.title}\nSummary: ${n.summary || 'N/A'}\nContent: ${n.content}`)
      .join('\n\n');

    const prompt = `
You are VoiceNote AI, a smart assistant. You help the user manage and query their notes.
Below is the content of the user's notes:
---
${contextString}
---

User Query: "${query}"

Answer the user's question accurately based ONLY on the notes context provided. If the information is not in the notes, explain that you couldn't find it. Keep the tone helpful, concise, and professional.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate an answer.';
  } catch (error) {
    console.error('Error in OpenAI Chat:', error);
    throw new Error('Failed to communicate with AI chat.');
  }
}
