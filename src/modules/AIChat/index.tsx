'use client';

import { useAIChat } from './CORE/hooks';
import { AIChatActions } from './CORE/actions';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Loader2, 
  MessageSquare
} from '../Dashboard/CORE/imports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface AIChatProps {
  noteId: string | null;
  noteTitle?: string | null;
  className?: string;
}

export default function AIChat({ noteId, noteTitle, className = '' }: AIChatProps) {
  const state = useAIChat(noteId);
  const actions = new AIChatActions(state);

  const { messages, inputText, isThinking } = state;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle Enter key submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      actions.handleSend();
    }
  };

  // Selectable prompt recommendations
  const quickPrompts = noteId
    ? [
        { label: 'Summarize this note', prompt: 'Give me a brief summary of this voice note.' },
        { label: 'Extract action items', prompt: 'List all action items mentioned in this note.' },
        { label: 'What are the deadlines?', prompt: 'What are the key deadlines or dates mentioned in this note?' }
      ]
    : [
        { label: 'Summarize all notes', prompt: 'Give me a summary of all my voice notes from this week.' },
        { label: 'What tasks are pending?', prompt: 'What tasks or deliverables are still pending?' },
        { label: 'Find design ideas', prompt: 'What design or product ideas have I recorded recently?' }
      ];

  return (
    <div className={`flex flex-col bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full ${className}`}>
      
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">AI Note Copilot</h3>
            {noteTitle && (
              <p className="text-[10px] text-indigo-300 font-medium truncate max-w-[150px]">
                Context: {noteTitle}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actions.handleClear()}
          className="h-8 w-8 text-slate-400 hover:text-white"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 p-4 relative z-10">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* AI Thinking Loader */}
          {isThinking && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-[12px] text-slate-400 font-medium">Copilot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts recommendation */}
        {messages.length === 1 && !isThinking && (
          <div className="mt-6 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">
              Suggested Prompts
            </p>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => actions.handleSelectPrompt(preset.prompt)}
                  className="w-full text-left p-2.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition duration-150"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Form */}
      <div className="p-3 border-t border-white/5 bg-slate-900/60 z-10 flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => actions.handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isThinking}
          className="bg-slate-950 border-white/10 text-white rounded-xl placeholder:text-slate-500 text-xs focus-visible:ring-indigo-500"
        />
        <Button
          onClick={() => actions.handleSend()}
          disabled={!inputText.trim() || isThinking}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl w-9 h-9 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
