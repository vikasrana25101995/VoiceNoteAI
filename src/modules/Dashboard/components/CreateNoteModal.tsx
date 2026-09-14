'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, PenTool, Sparkles, Loader2, Check } from 'lucide-react';
import VoiceRecorder from '../../VoiceRecorder';
import { Folder } from '../CORE/types';

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: 'voice' | 'type';
  folders: Folder[];
  onSuccess: (noteId: string) => void;
}

export default function CreateNoteModal({
  open,
  onOpenChange,
  initialMode = 'type',
  folders,
  onSuccess,
}: CreateNoteModalProps) {
  const [mode, setMode] = useState<'voice' | 'type'>(initialMode);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setMode(initialMode);
      setTitle('');
      setContent('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleCreateTypedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please type some content for your note.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (autoAnalyze) {
        // Send to /api/analyze for automatic AI transcription, summary, & task extraction
        const customOpenAIKey = localStorage.getItem('openai_api_key') || undefined;
        const customGeminiKey = localStorage.getItem('gemini_api_key') || undefined;

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customOpenAIKey ? { 'x-openai-api-key': customOpenAIKey } : {}),
            ...(customGeminiKey ? { 'x-gemini-api-key': customGeminiKey } : {}),
          },
          body: JSON.stringify({
            transcript: content,
            duration: Math.ceil(content.split(/\s+/).length / 2.5), // Approximate reading time in seconds
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to analyze typed note.');
        }

        const data = await res.json();
        
        // If user entered a custom title or folder, update note
        if ((title.trim() || selectedFolderId) && data.note?.id) {
          await fetch(`/api/notes/${data.note.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: title.trim() || undefined, 
              folderId: selectedFolderId === 'unassigned' ? null : (selectedFolderId || undefined) 
            }),
          });
        }

        onSuccess(data.note.id);
        handleOpenChange(false);
      } else {
        // Create standard note directly
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || content.slice(0, 30) + '...',
            content,
            folderId: selectedFolderId === 'unassigned' ? null : (selectedFolderId || undefined),
            tags: ['Typed'],
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to create note.');
        }

        const note = await res.json();
        onSuccess(note.id);
        handleOpenChange(false);
      }
    } catch (err: any) {
      console.error('Error creating typed note:', err);
      setError(err.message || 'Something went wrong creating your note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-0 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header with Mode Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
            Create Note
          </DialogTitle>
          
          <div className="bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setMode('type')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'type'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>Type Note</span>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'voice'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-indigo-500" />
              <span>Voice Record</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {mode === 'voice' ? (
          <div className="p-4">
            <VoiceRecorder onSuccess={(id) => { onSuccess(id); handleOpenChange(false); }} />
          </div>
        ) : (
          <form onSubmit={handleCreateTypedNote} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            {/* Note Title Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Note Title <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Project Team Sync or Invoice Discussion"
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl h-10"
              />
            </div>

            {/* Folder Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Folder Category
              </Label>
              <Select value={selectedFolderId} onValueChange={(val) => setSelectedFolderId(val || '')}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl h-10">
                  <SelectValue placeholder="Select a folder..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Note Content / Transcript
              </Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste your notes, action items, or meeting thoughts here..."
                rows={5}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl resize-none leading-relaxed"
                required
              />
            </div>

            {/* AI Auto-Summarize Checkbox */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#635BFF]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Auto-Summarize & Extract Tasks</div>
                  <div className="text-[10px] text-slate-500">Automatically generate AI summary and action items</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                  autoAnalyze ? 'bg-[#635BFF] border-[#635BFF] text-white' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {autoAnalyze && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </button>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 px-4 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing & Creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Note</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

      </DialogContent>
    </Dialog>
  );
}
