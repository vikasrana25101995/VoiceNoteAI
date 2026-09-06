export class AIChatService {
  async sendQuery(query: string, noteId?: string | null): Promise<string> {
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, noteId }),
      });

      if (!res.ok) {
        let message = 'Failed to get response';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          message = `${message} (server returned ${res.status} ${res.statusText || ''}).`.trim();
        }
        throw new Error(message);
      }

      const data = await res.json();
      return data.response;
    } catch (error: any) {
      console.error('Service error sending chat query:', error);
      throw new Error(error.message || 'Failed to send chat query.');
    }
  }
}

export const aiChatService = new AIChatService();
