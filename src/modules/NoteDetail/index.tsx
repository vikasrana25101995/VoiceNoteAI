'use client';

import { useNoteDetail } from './CORE/hooks';
import { NoteDetailActions } from './CORE/actions';
import { REWRITE_MODES } from './CORE/constants';
import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trash,
  Copy,
  Check,
  Clock,
  Tag,
  Folder as FolderIcon,
  Loader2,
  Play,
  Pause,
  Download,
  X,
  Plus,
  Wand2,
  ListTodo,
  FileText,
  Share2,
  CheckSquare,
  Send,
  Square,
  MessageSquare,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { noteDetailService } from './CORE/services';
import { usePrompt } from '@/components/usePrompt';
import { parseTodoLine, formatTodoLine, todayISO, formatDue, type TodoLine } from './CORE/todoLine';

interface NoteDetailProps {
  noteId: string | null;
  onClose?: () => void;
  onNoteUpdated?: () => void;
  onDeleteNote?: (id: string) => void;
  onOpenCopilot?: () => void;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function NoteDetail({ noteId, onClose, onNoteUpdated, onDeleteNote }: NoteDetailProps) {
  const state = useNoteDetail(noteId, onNoteUpdated);
  const actions = new NoteDetailActions(state);

  const {
    note,
    loading,
    isEditing,
    setIsEditing,
    editedTitle,
    setEditedTitle,
    editedContent,
    setEditedContent,
    editedSummary,
    setEditedSummary,
    saveNoteChanges,
    saving
  } = state;

  // Assistant & Chat State
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState<string | null>(null);

  // Interactive Action Items & To-dos State
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});
  const [newTodoInput, setNewTodoInput] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isExtractingTodos, setIsExtractingTodos] = useState(false);
  const [isTodoMode, setIsTodoMode] = useState(false);
  const [newCanvasTodoText, setNewCanvasTodoText] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [addType, setAddType] = useState<'item' | 'heading'>('item');
  const [keepWritingText, setKeepWritingText] = useState('');
  const [ask, promptDialog] = usePrompt();

  // Tags State
  const [tags, setTags] = useState<string[]>(['Work']);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Dynamic Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when active note changes
  useEffect(() => {
    if (note) {
      setTags(note.tags || []);
      setTodoContent(note.todos || '');
      setCompletedActions({});
      setChatMessages([]);
    }
  }, [noteId, note]);

  // Audio Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (!noteId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-white rounded-2xl border border-neutral-200 shadow-xs">
        <FileText className="w-12 h-12 mb-3 stroke-[1.5] text-neutral-300" />
        <h4 className="font-bold text-neutral-600 text-lg">No Note Selected</h4>
        <p className="text-sm max-w-xs mt-1 text-neutral-400">Select a note from the list to view and edit.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-500 bg-white rounded-2xl border border-neutral-200">
        <Loader2 className="w-8 h-8 animate-spin text-[#234B36] mb-2" />
        <span className="text-sm font-semibold">Loading note...</span>
      </div>
    );
  }

  if (!note) return null;

  const wordCount = (editedContent || note.content || '').trim().split(/\s+/).filter(Boolean).length;

  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : 'Today';

  // Derive action items list dynamically from note without dummy fallbacks
  const rawActions = note.actionItems || note.bulletPoints || '';
  const dynamicActionItems: string[] = rawActions
    ? rawActions
      .split('\n')
      .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean)
    : [];

  const toggleActionItem = (idx: number) => {
    setCompletedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddTag = async () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      const updatedTags = [...tags, newTagInput.trim()];
      setTags(updatedTags);
      setNewTagInput('');
      setIsAddingTag(false);
      await noteDetailService.updateNote(note.id, { tags: updatedTags });
      if (onNoteUpdated) onNoteUpdated();
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    await noteDetailService.updateNote(note.id, { tags: updatedTags });
    if (onNoteUpdated) onNoteUpdated();
  };

  // Dynamic Audio Recording Trigger
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording via Web Audio API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          setIsTranscribing(true);
          try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');

            const headers: Record<string, string> = {};
            if (typeof window !== 'undefined') {
              const openAIKey = localStorage.getItem('openai_api_key');
              if (openAIKey) headers['x-openai-api-key'] = openAIKey;
              const geminiKey = localStorage.getItem('gemini_api_key');
              if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
            }

            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers,
              body: formData,
            });

            const data = await res.json();
            const transcribedText = data.text || 'Recorded audio note.';
            const newContent = (editedContent ? editedContent + '\n\n' : '') + transcribedText;
            setEditedContent(newContent);
            await noteDetailService.updateNote(note.id, { content: newContent });
            if (onNoteUpdated) onNoteUpdated();

            // Auto-trigger analysis for summary and action items if missing
            try {
              const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ transcript: newContent }),
              });
              if (analyzeRes.ok) {
                const analyzed = await analyzeRes.json();
                if (analyzed.summary || analyzed.actionItems) {
                  const updatePayload: Record<string, any> = {};
                  if (analyzed.summary) {
                    updatePayload.summary = analyzed.summary;
                    setEditedSummary(analyzed.summary);
                  }
                  if (analyzed.actionItems && Array.isArray(analyzed.actionItems)) {
                    updatePayload.actionItems = analyzed.actionItems.join('\n');
                  }
                  await noteDetailService.updateNote(note.id, updatePayload);
                  if (onNoteUpdated) onNoteUpdated();
                }
              }
            } catch (aErr) {
              console.error('Auto-analyze after recording error:', aErr);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            alert('Failed to process audio recording.');
          } finally {
            setIsTranscribing(false);
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access error:', err);
        alert('Microphone access is required for voice recording.');
      }
    }
  };

  const saveTodos = (updated: string) => {
    setTodoContent(updated);
    noteDetailService.updateNote(note.id, { todos: updated });
    if (onNoteUpdated) onNoteUpdated();
  };

  // Extract To-dos / Action Items with AI
  const handleExtractTodos = async () => {
    setIsAssistantOpen(true);
    setIsExtractingTodos(true);
    try {
      const textToAnalyze = editedContent || note.content || note.title;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const openAIKey = localStorage.getItem('openai_api_key');
        if (openAIKey) headers['x-openai-api-key'] = openAIKey;
        const geminiKey = localStorage.getItem('gemini_api_key');
        if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ transcript: textToAnalyze }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.actionItems && Array.isArray(data.actionItems)) {
          const formattedActions = data.actionItems.join('\n');
          await noteDetailService.updateNote(note.id, { actionItems: formattedActions });
          note.actionItems = formattedActions;

          if (isTodoMode) {
            const newLines = data.actionItems.map((item: string) => `- [ ] ${item}`).join('\n');
            saveTodos(todoContent ? `${todoContent}\n${newLines}` : newLines);
          }

          if (onNoteUpdated) onNoteUpdated();
        }
      }
    } catch (err) {
      console.error('Error extracting to-dos:', err);
    } finally {
      setIsExtractingTodos(false);
    }
  };

  // Add custom to-do item manually
  const handleAddCustomTodo = async () => {
    if (!newTodoInput.trim()) return;
    const currentList = rawActions ? rawActions.split('\n').filter(Boolean) : [];
    const updatedList = [...currentList, newTodoInput.trim()];
    const updatedActionItems = updatedList.join('\n');
    setNewTodoInput('');
    setIsAddingTodo(false);
    await noteDetailService.updateNote(note.id, { actionItems: updatedActionItems });
    note.actionItems = updatedActionItems;
    if (onNoteUpdated) onNoteUpdated();
  };

  // Dynamic AI Transformation Actions ("DO MORE")
  const handleDoMoreAction = async (actionLabel: string) => {
    setAiActionLoading(actionLabel);
    try {
      let mode = 'tidy';
      let prompt = actionLabel;

      if (actionLabel === 'Tidy up transcript') {
        mode = 'tidy';
        prompt = 'Clean up filler words, fix grammar and format as a clean transcript.';
      } else if (actionLabel === 'Shorter') {
        mode = 'shorter';
        prompt = 'Make this note text concise and shorter.';
      } else if (actionLabel === 'Suggest a title') {
        mode = 'title';
        prompt = 'Suggest a clear, professional headline title for this note.';
      } else if (actionLabel === 'Draft an email') {
        mode = 'email';
        prompt = 'Draft a professional email update based on this note.';
      }

      const result = await noteDetailService.runRewrite(note.id, mode, prompt);
      if (result) {
        if (actionLabel === 'Suggest a title') {
          const cleanTitle = result.replace(/^["']|["']$/g, '').trim();
          setEditedTitle(cleanTitle);
          await noteDetailService.updateNote(note.id, { title: cleanTitle });
        } else {
          setEditedContent(result);
          await noteDetailService.updateNote(note.id, { content: result });
        }
        if (onNoteUpdated) onNoteUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'AI action failed.');
    } finally {
      setAiActionLoading(null);
    }
  };

  // Dynamic AI Chat Question Submission
  const handleSendAssistantChat = async () => {
    if (!assistantInput.trim() || isAiThinking) return;

    const userQuery = assistantInput.trim();
    setAssistantInput('');

    const userMessage: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQuery,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          query: userQuery,
        }),
      });

      const data = await res.json();
      const aiResponse = data.response || 'I have analyzed your note regarding this query.';

      const aiMessage: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const formatRecTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Count completed and total todo items for To-do mode header
  const allContentLines = (todoContent || '').split('\n').filter((l) => l.trim().length > 0);
  const todoItemsOnly = allContentLines.filter((l) => !/^(#{1,6}\s|\[heading\]|\[section\])/i.test(l.trim()));
  const totalTodoCount = todoItemsOnly.length;
  const completedTodoCount = todoItemsOnly.filter((l) => /^(- \[[xX]\]|\[[xX]\])/.test(l.trim())).length;

  const handleAppendTextFromBottom = () => {
    if (!keepWritingText.trim()) return;
    const newContent = editedContent
      ? `${editedContent}\n\n${keepWritingText.trim()}`
      : keepWritingText.trim();
    setEditedContent(newContent);
    setKeepWritingText('');
    noteDetailService.updateNote(note.id, { content: newContent });
    if (onNoteUpdated) onNoteUpdated();
  };

  const handleAddTodoFromBottom = () => {
    if (!newCanvasTodoText.trim()) return;
    const lineToAdd = addType === 'heading'
      ? `## ${newCanvasTodoText.trim()}`
      : `- [ ] ${newCanvasTodoText.trim()}`;

    const lines = (todoContent || '').split('\n').filter(Boolean);
    lines.push(lineToAdd);
    setNewCanvasTodoText('');
    saveTodos(lines.join('\n'));
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs text-neutral-900">
      {promptDialog}

      {/* TOP BAR HEADER (Crisp White Background) */}
      <div className="h-14 px-6 border-b border-neutral-200/70 flex items-center justify-between bg-white shrink-0">
        {/* Left Status */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal">
          <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{saving ? 'Saving changes...' : 'All changes saved'}</span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">

          {/* Share Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Note link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Share</span>
          </button>

          {/* Assistant Toggle Button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${isAssistantOpen
              ? 'bg-[#234B36] text-white hover:bg-[#1A3A2A]'
              : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Assistant</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN SPLIT CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-white">

        {/* MAIN EDITOR CANVAS (Left Pane - Soft Warm Ivory `#FAFAF8`) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#FAFAF8]">
          <ScrollArea className="flex-1 p-8 md:p-12 pb-32">
            <div className="max-w-3xl space-y-6">

              {/* Document Title (Serif Display Font - Instrument Serif with Fixed Width) */}
              <div className="w-full min-w-0 max-w-full overflow-hidden">
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={saveNoteChanges}
                    onKeyDown={(e) => e.key === 'Enter' && saveNoteChanges()}
                    className="w-full text-3xl md:text-4xl font-serif bg-white border border-neutral-200 text-neutral-900 rounded-xl py-3 px-4 focus-visible:ring-1 focus-visible:ring-[#234B36]"
                    placeholder="Note title..."
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditing(true)}
                    className="w-full text-3xl md:text-4xl font-serif text-neutral-900 font-normal tracking-tight leading-snug cursor-text hover:text-neutral-800 break-words"
                  >
                    {editedTitle || note.title}
                  </h1>
                )}
              </div>

              {/* Metadata Subtitle */}
              <div className="text-xs text-neutral-400 font-sans font-normal flex items-center gap-1.5">
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{wordCount} words</span>
              </div>

              {/* Category / Folder & Tags Section */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200/80 bg-emerald-50/50 text-xs font-semibold text-emerald-900 shadow-2xs">
                  <FolderIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Category: {note.folder?.name || 'Unassigned'}</span>
                  <button
                    onClick={async () => {
                      const catName = await ask({
                        title: 'Change category',
                        description: 'Move this note into a category. A new one is created if it does not exist.',
                        placeholder: 'e.g. Work',
                        confirmLabel: 'Move note',
                      });
                      if (catName) {
                        const folderRes = await fetch('/api/folders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: catName }),
                        });
                        const folderObj = await folderRes.json();
                        if (folderObj?.id) {
                          await noteDetailService.updateNote(note.id, { folderId: folderObj.id });
                          if (onNoteUpdated) onNoteUpdated();
                        }
                      }
                    }}
                    className="text-emerald-700 hover:text-emerald-950 underline ml-1 cursor-pointer font-medium"
                    title="Change category"
                  >
                    Change
                  </button>
                </div>

                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-700 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neutral-400 hover:text-neutral-600 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Tag name..."
                      className="px-2.5 py-0.5 text-xs rounded-full border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#234B36]"
                    />
                    <button
                      onClick={handleAddTag}
                      className="text-xs text-[#234B36] font-semibold hover:underline px-1 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-neutral-300 bg-white text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tag</span>
                  </button>
                )}
              </div>

              {/* Mode Switcher Segmented Control (≡ Text vs ☑ To-do matching user screenshots) */}
              <div className="pt-2 pb-1">
                <div className="inline-flex items-center gap-1 p-1 bg-[#EFEFEA] rounded-xl border border-neutral-200/50">
                  <button
                    type="button"
                    onClick={() => setIsTodoMode(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !isTodoMode
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTodoMode(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isTodoMode
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-neutral-700" />
                    <span>To-do</span>
                  </button>
                </div>
              </div>

              <div className="border-b border-neutral-200/60" />

              {/* Main Canvas Area (To-do Mode vs Text Mode) */}
              {isTodoMode ? (
                <div className="space-y-4 pt-1">
                  {/* Top Bar inside To-do Mode */}
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-medium text-neutral-500">
                      {completedTodoCount} of {totalTodoCount} done
                    </span>
                    <button
                      type="button"
                      onClick={handleExtractTodos}
                      disabled={isExtractingTodos}
                      className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-[#234B36] hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isExtractingTodos ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#234B36]" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#234B36]" />
                      )}
                      <span>Extract to-dos with AI</span>
                    </button>
                  </div>

                  {/* Checklist & Headings Container */}
                  <div className="space-y-2">
                    {((todoContent || '').split('\n').filter((l) => l.trim().length > 0).length === 0) ? (
                      <div className="p-8 text-center bg-white border border-dashed border-neutral-200 rounded-2xl text-neutral-400 text-sm italic">
                        No to-do items yet. Add an item below or extract to-dos from AI!
                      </div>
                    ) : (
                      (todoContent || '').split('\n').map((line, idx) => {
                        if (!line.trim()) return null;

                        const isHeading = /^(#{1,6}\s|\[heading\]|\[section\])/i.test(line.trim());
                        if (isHeading) {
                          const cleanHeading = line.replace(/^(#{1,6}\s|\[heading\]|\[section\])\s*/i, '').trim();
                          return (
                            <div key={idx} className="flex items-center gap-3 pt-6 pb-2 border-b border-neutral-200/40 group">
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">
                                {cleanHeading}
                              </span>
                              <div className="flex-1 h-[1px] bg-neutral-200/40" />
                              <button
                                type="button"
                                onClick={() => {
                                  const lines = (todoContent || '').split('\n');
                                  lines.splice(idx, 1);
                                  saveTodos(lines.join('\n'));
                                }}
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                                title="Delete section"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        }

                        const todo = parseTodoLine(line);
                        const isChecked = todo.checked;
                        const isOverdue = !!todo.due && !isChecked && todo.due < todayISO();
                        const updateTodo = (changes: Partial<TodoLine>, persist = true) => {
                          const lines = (todoContent || '').split('\n');
                          lines[idx] = formatTodoLine({ ...parseTodoLine(lines[idx] || ''), ...changes });
                          if (persist) saveTodos(lines.join('\n'));
                          else setTodoContent(lines.join('\n'));
                        };

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 py-1.5 group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => updateTodo({ checked: !isChecked })}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#234B36] border-[#234B36] text-white'
                                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <input
                                type="text"
                                value={todo.text}
                                onChange={(e) => updateTodo({ text: e.target.value }, false)}
                                onBlur={() => saveTodos(todoContent)}
                                className={`w-full bg-transparent text-base font-sans focus:outline-none border-none ${
                                  isChecked ? 'line-through text-neutral-400' : 'text-neutral-800 font-normal'
                                }`}
                              />
                            </div>

                            {/* Due date: native picker under a styled pill */}
                            <label
                              title={todo.due ? 'Change due date' : 'Add due date'}
                              className={`relative shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-all cursor-pointer focus-within:opacity-100 focus-within:ring-1 focus-within:ring-[#234B36] ${
                                todo.due
                                  ? isOverdue
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : isChecked
                                      ? 'border-neutral-200 bg-white text-neutral-400'
                                      : 'border-neutral-200 bg-white text-neutral-600'
                                  : 'border-transparent text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <CalendarDays className="w-3.5 h-3.5" />
                              {todo.due && <span>{formatDue(todo.due)}</span>}
                              <input
                                type="date"
                                value={todo.due}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                onChange={(e) => updateTodo({ due: e.target.value })}
                                aria-label="Due date"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const lines = (todoContent || '').split('\n');
                                lines.splice(idx, 1);
                                saveTodos(lines.join('\n'));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
                              title="Delete to-do"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Add Row in To-do mode (Matching Image 1) */}
                  <div className="flex items-center gap-2 pt-6">
                    <div className="inline-flex items-center gap-0.5 p-1 bg-[#EFEFEA] rounded-xl border border-neutral-200/60 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setAddType('item')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          addType === 'item'
                            ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                            : 'text-neutral-500 hover:text-neutral-800 font-medium'
                        }`}
                      >
                        Item
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddType('heading')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          addType === 'heading'
                            ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                            : 'text-neutral-500 hover:text-neutral-800 font-medium'
                        }`}
                      >
                        Heading
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newCanvasTodoText}
                      onChange={(e) => setNewCanvasTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCanvasTodoText.trim()) {
                          e.preventDefault();
                          handleAddTodoFromBottom();
                        }
                      }}
                      placeholder={addType === 'heading' ? 'Section heading' : 'Add a to-do item...'}
                      className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#234B36] shadow-2xs"
                    />

                    <button
                      type="button"
                      onClick={handleAddTodoFromBottom}
                      className="px-5 py-2.5 bg-[#234B36] text-white text-sm font-medium rounded-xl hover:bg-[#1A3A2A] transition-colors cursor-pointer shadow-2xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                /* Text Mode (Direct Document Editor) */
                <div className="space-y-6 pt-1">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onBlur={saveNoteChanges}
                    placeholder="Keep writing..."
                    className="w-full min-h-[380px] border-none bg-transparent resize-none p-0 focus-visible:ring-0 text-base leading-relaxed text-neutral-800 font-sans shadow-none placeholder:text-neutral-400"
                  />
                </div>
              )}

            </div>
          </ScrollArea>

          {/* FLOATING BOTTOM VOICE RECORDING CAPSULE (Centered Pill Widget matching PDF) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
            <div className="bg-[#1A1A1A] text-white rounded-full p-2 pl-5 pr-2.5 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
              {/* Equalizer Bars Graphic */}
              <div className="flex items-center gap-1 h-5">
                {[50, 80, 40, 100, 70, 90, 60, 45].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${isRecording ? 'animate-pulse' : ''
                      }`}
                    style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>

              <span className="text-xs font-medium text-white/90">
                {isTranscribing ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    Transcribing AI...
                  </span>
                ) : isRecording ? (
                  `Recording (${formatRecTimer(recordingSeconds)})`
                ) : (
                  'Tap to record'
                )}
              </span>

              <button
                onClick={handleToggleRecord}
                disabled={isTranscribing}
                className="bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isRecording ? 'Stop' : 'Record'}
              </button>
            </div>
          </div>
        </div>

        {/* ASSISTANT SIDE PANEL (Right Split View with Dynamic AI Responses) */}
        {isAssistantOpen && (
          <aside className="w-80 md:w-96 bg-[#F7F7F4] border-l border-neutral-200/80 flex flex-col shrink-0">

            {/* Assistant Panel Header */}
            <div className="p-5 border-b border-neutral-200/60 flex items-center justify-between bg-[#F7F7F4]">
              <h3 className="font-semibold text-neutral-900 text-base">
                Assistant
              </h3>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Assistant Content */}
            <ScrollArea className="flex-1 p-5 space-y-6">
              <div className="space-y-6">

                {/* Section 1: SUMMARY */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    SUMMARY
                  </h4>
                  <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
                    {(editedSummary || note.summary) ? (
                      editedSummary || note.summary
                    ) : (
                      <span className="text-neutral-400 italic">No summary generated for this note yet.</span>
                    )}
                  </div>
                </div>

                {/* Section 2: ACTION ITEMS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      ACTION ITEMS
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleExtractTodos}
                        disabled={isExtractingTodos}
                        className="text-[11px] text-[#234B36] font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isExtractingTodos ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-[#234B36]" />
                        )}
                        <span>Extract AI</span>
                      </button>
                      <button
                        onClick={() => setIsAddingTodo(!isAddingTodo)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors cursor-pointer"
                        title="Add action item"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isAddingTodo && (
                    <div className="mb-3 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newTodoInput}
                        onChange={(e) => setNewTodoInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTodo()}
                        placeholder="Add a new action item..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#234B36] shadow-2xs"
                      />
                      <button
                        onClick={handleAddCustomTodo}
                        className="px-3 py-2 bg-[#234B36] text-white text-xs font-semibold rounded-xl hover:bg-[#1A3A2A] transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {dynamicActionItems.length === 0 ? (
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs text-xs text-neutral-400 font-sans italic text-center space-y-2">
                        <p>No action items found for this note.</p>
                        <button
                          onClick={handleExtractTodos}
                          disabled={isExtractingTodos}
                          className="px-3 py-1.5 bg-[#234B36] text-white text-xs font-semibold rounded-xl hover:bg-[#1A3A2A] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate To-dos with AI</span>
                        </button>
                      </div>
                    ) : (
                      dynamicActionItems.map((item, idx) => {
                        const isChecked = !!completedActions[idx];
                        return (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-start justify-between gap-3 group transition-all select-none"
                          >
                            <div
                              onClick={() => toggleActionItem(idx)}
                              className="flex items-start gap-3 cursor-pointer flex-1"
                            >
                              <div
                                className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${isChecked
                                  ? 'bg-[#234B36] border-[#234B36] text-white'
                                  : 'border-neutral-300 bg-white'
                                  }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span
                                className={`text-xs sm:text-sm leading-snug ${isChecked
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-800'
                                  }`}
                              >
                                {item}
                              </span>
                            </div>

                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const updated = dynamicActionItems.filter((_, i) => i !== idx).join('\n');
                                await noteDetailService.updateNote(note.id, { actionItems: updated });
                                note.actionItems = updated;
                                if (onNoteUpdated) onNoteUpdated();
                              }}
                              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                              title="Delete to-do"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Section 3: DO MORE */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    DO MORE
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Tidy up transcript',
                      'Shorter',
                      'Suggest a title',
                      'Draft an email',
                    ].map((action, i) => {
                      const isLoadingThis = aiActionLoading === action;
                      return (
                        <button
                          key={i}
                          disabled={!!aiActionLoading}
                          onClick={() => handleDoMoreAction(action)}
                          className="px-3.5 py-2 bg-white border border-neutral-200/90 rounded-full text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {isLoadingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#234B36]" />
                          ) : null}
                          <span>{action}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Assistant Chat Thread */}
                {chatMessages.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      ASSISTANT CONVERSATION
                    </h4>
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.sender === 'user'
                            ? 'bg-[#234B36] text-white ml-6'
                            : 'bg-white border border-neutral-200/80 text-neutral-800 mr-6 shadow-2xs'
                            }`}
                        >
                          {msg.text}
                        </div>
                      ))}

                      {isAiThinking && (
                        <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-500 text-xs flex items-center gap-2 mr-6">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#234B36]" />
                          <span>Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </ScrollArea>

            {/* Bottom Assistant Input Box ("Ask about this note...") */}
            <div className="p-4 border-t border-neutral-200/60 bg-[#F7F7F4]">
              <div className="relative">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendAssistantChat();
                    }
                  }}
                  placeholder="Ask about this note..."
                  className="w-full px-4 py-3 pr-10 bg-white border border-neutral-200 rounded-2xl text-xs sm:text-sm placeholder:text-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#234B36] shadow-2xs"
                />
                <button
                  type="button"
                  disabled={isAiThinking}
                  onClick={handleSendAssistantChat}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#234B36] p-1 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </aside>
        )}

      </div>
    </div>
  );
}
