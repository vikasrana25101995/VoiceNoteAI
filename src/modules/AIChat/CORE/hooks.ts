import { useState, useEffect } from 'react';
import { Message } from './types';
import { aiChatService } from './services';

export function useAIChat(noteId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Reset chat when switching notes to start a fresh thread
  useEffect(() => {
    setMessages([
      {
        id: 'initial',
        sender: 'ai',
        text: noteId 
          ? "Ask me anything about this specific note! I can summarize details, check timelines, or list action items."
          : "Hello! Ask me any question about your voice notes. I can search through them, find details, or summarize your tasks.",
        createdAt: new Date().toISOString(),
      }
    ]);
    setInputText('');
  }, [noteId]);

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: queryText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const reply = await aiChatService.sendQuery(queryText, noteId);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: err.message || 'Sorry, I encountered an error. Please check your database connection or try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'initial',
        sender: 'ai',
        text: noteId 
          ? "Chat cleared. Ask me anything about this specific note!"
          : "Chat cleared. Ask me any question about your voice notes.",
        createdAt: new Date().toISOString(),
      }
    ]);
  };

  return {
    messages,
    inputText,
    setInputText,
    isThinking,
    submitQuery,
    clearChat
  };
}
export type AIChatState = ReturnType<typeof useAIChat>;
