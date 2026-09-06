import { AnalysisResponse } from './types';

async function parseErrorResponse(res: Response, fallback: string): Promise<string> {
  try {
    const err = await res.json();
    return err.error || fallback;
  } catch {
    return `${fallback} (server returned ${res.status} ${res.statusText || ''}).`.trim();
  }
}

export class VoiceRecorderService {
  async uploadAudio(audioBlob: Blob): Promise<{ text: string; audioUrl: string | null }> {
    let filename = 'recording.webm';
    if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) {
      filename = 'recording.mp4';
    } else if (audioBlob.type.includes('wav')) {
      filename = 'recording.wav';
    } else if (audioBlob.type.includes('ogg')) {
      filename = 'recording.ogg';
    }

    const formData = new FormData();
    formData.append('file', audioBlob, filename);

    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const openAIKey = localStorage.getItem('openai_api_key');
      if (openAIKey) {
        headers['x-openai-api-key'] = openAIKey;
      }
      const geminiKey = localStorage.getItem('gemini_api_key');
      if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
    }

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseErrorResponse(res, 'Transcription failed'));
    }

    const data = await res.json();
    return { text: data.text, audioUrl: data.audioUrl || null };
  }

  async runAnalysis(transcript: string, duration: number, audioUrl?: string | null): Promise<AnalysisResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const openAIKey = localStorage.getItem('openai_api_key');
      if (openAIKey) {
        headers['x-openai-api-key'] = openAIKey;
      }
      const geminiKey = localStorage.getItem('gemini_api_key');
      if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
    }

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({ transcript, duration, audioUrl }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorResponse(res, 'AI analysis failed'));
    }

    return res.json();
  }
}

export const voiceRecorderService = new VoiceRecorderService();
