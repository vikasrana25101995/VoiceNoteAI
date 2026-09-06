import { Note } from './types';

export class NoteDetailService {
  async fetchNote(id: string): Promise<Note | null> {
    try {
      const res = await fetch(`/api/notes/${id}`);
      if (!res.ok) throw new Error('Failed to fetch note details');
      return res.json();
    } catch (error) {
      console.error('Service error fetching note detail:', error);
      return null;
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update note');
      return res.json();
    } catch (error) {
      console.error('Service error updating note:', error);
      return null;
    }
  }

  async runRewrite(id: string, mode: string, prompt: string): Promise<string> {
    try {
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

      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify({ noteId: id, mode, prompt }),
      });
      if (!res.ok) {
        let message = 'Failed to rewrite note';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          message = `${message} (server returned ${res.status} ${res.statusText || ''}).`.trim();
        }
        throw new Error(message);
      }
      const data = await res.json();
      return data.rewrittenText;
    } catch (error: any) {
      console.error('Service error rewriting note:', error);
      throw new Error(error.message || 'Failed to rewrite note');
    }
  }
}

export const noteDetailService = new NoteDetailService();
