'use client';

import { useNoteDetail } from './CORE/hooks';
import { NoteDetailActions } from './CORE/actions';
import { REWRITE_MODES } from './CORE/constants';
import { 
  useState,
  useEffect,
  useRef,
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
  Wand2,
  ListTodo,
  FileText
} from './CORE/imports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NoteDetailProps {
  noteId: string | null;
  onClose?: () => void;
  onNoteUpdated?: () => void;
  onDeleteNote?: (id: string) => void;
}

export default function NoteDetail({ noteId, onClose, onNoteUpdated, onDeleteNote }: NoteDetailProps) {
  const state = useNoteDetail(noteId, onNoteUpdated);
  const actions = new NoteDetailActions(state);

  const { 
    note, 
    loading, 
    isEditing, 
    editedTitle, 
    setEditedTitle, 
    editedContent, 
    setEditedContent, 
    editedSummary, 
    setEditedSummary,
    activeTab, 
    rewriteMode, 
    rewrittenText, 
    rewriting, 
    saving 
  } = state;

  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Real Audio Playback with Simulation Fallback
  const togglePlay = () => {
    if (note && note.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(note.audioUrl);
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            setPlaybackTime(Math.floor(audioRef.current.currentTime));
          }
        });
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setPlaybackTime(0);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    } else {
      // Audio Playback simulation fallback for mock notes
      if (isPlaying) {
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        playbackIntervalRef.current = setInterval(() => {
          setPlaybackTime((prev) => {
            if (note && note.duration && prev >= note.duration) {
              setIsPlaying(false);
              if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      }
    }
  };

  useEffect(() => {
    setPlaybackTime(0);
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [noteId]);

  if (!noteId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
        <FileText className="w-12 h-12 mb-3 stroke-[1.5] text-slate-600" />
        <h4 className="font-bold text-slate-400">No Note Selected</h4>
        <p className="text-sm max-w-xs mt-1">Select a note from the dashboard to view summaries, tasks, transcripts, and more.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-sm font-semibold">Loading note analysis...</span>
      </div>
    );
  }

  if (!note) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const mdContent = `
# ${note.title}
Date: ${new Date(note.createdAt).toLocaleDateString()}

## Summary
${note.summary || 'No summary available.'}

## Key Takeaways
${note.bulletPoints || 'No bullet points generated.'}

## Action Items
${note.actionItems || 'No action items extracted.'}

## Transcript
${note.content}
    `.trim();

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedRewritePreset = REWRITE_MODES.find(m => m.id === rewriteMode);

  return (
    <div className="h-full flex flex-col bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header Controls */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between gap-4 bg-slate-900/60 z-10">
        <div className="flex items-center gap-2">
          {note.folder && (
            <Badge variant="outline" className={`${note.folder.color || 'bg-slate-800 text-slate-400'}`}>
              <FolderIcon className="w-3.5 h-3.5 mr-1" />
              {note.folder.name}
            </Badge>
          )}
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadMarkdown}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          {onDeleteNote && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDeleteNote(note.id)}
              className="h-8 w-8 hover:bg-red-500"
            >
              <Trash className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <ScrollArea className="flex-1 p-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Title Editor / Renderer */}
          <div>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold bg-slate-900/60 border-white/10 text-white rounded-xl py-6"
                placeholder="Enter title..."
              />
            ) : (
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{note.title}</h2>
            )}
          </div>

          {/* Audio Playback Strip */}
          {note.duration && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <Button
                size="icon"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </Button>
              <div className="flex-1 flex flex-col">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(playbackTime / note.duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                  <span>{Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Tabs switcher */}
          <Tabs value={activeTab} onValueChange={(v) => actions.handleTabChange(v as any)} className="w-full">
            <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-xl w-full grid grid-cols-4">
              <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Summary</TabsTrigger>
              <TabsTrigger value="transcript" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Transcript</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Key Points</TabsTrigger>
              <TabsTrigger value="rewrite" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">AI Edit</TabsTrigger>
            </TabsList>

            {/* TAB: SUMMARY */}
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-2">AI Summary</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="min-h-32 bg-slate-900/60 border-white/10 text-slate-200"
                      placeholder="Note Summary..."
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed text-[15px] bg-white/5 border border-white/5 rounded-2xl p-5">
                      {note.summary || 'No summary available.'}
                    </p>
                  )}
                </div>

                {/* Tags section */}
                {note.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((t, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: TRANSCRIPT */}
            <TabsContent value="transcript" className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Full Transcript</h4>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(note.content)}
                      className="text-slate-400 hover:text-white h-7 px-2"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-64 bg-slate-900/60 border-white/10 text-slate-200 font-sans text-[15px]"
                    placeholder="Transcript text..."
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed font-sans text-[15px] bg-white/5 border border-white/5 rounded-2xl p-5 whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* TAB: KEY POINTS & TASKS */}
            <TabsContent value="tasks" className="mt-4 space-y-5">
              {/* Takeaways List */}
              {note.bulletPoints && (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-3">Key Takeaways</h4>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300 text-[14px]">
                    {note.bulletPoints.split('\n').filter(Boolean).map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">{pt.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items List */}
              {note.actionItems && (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-3 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4" /> Action Items
                  </h4>
                  <ul className="list-decimal pl-5 space-y-2 text-slate-300 text-[14px]">
                    {note.actionItems.split('\n').filter(Boolean).map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* TAB: AI REWRITE */}
            <TabsContent value="rewrite" className="mt-4 space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Select value={rewriteMode} onValueChange={(v) => actions.handleRewriteModeChange(v || '')}>
                      <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Select rewrite format" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-white/10 text-white">
                        {REWRITE_MODES.map((mode) => (
                          <SelectItem key={mode.id} value={mode.id}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => actions.triggerRewrite(selectedRewritePreset?.prompt || '')}
                    disabled={rewriting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shrink-0"
                  >
                    {rewriting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-1.5" />
                        Reformat Note
                      </>
                    )}
                  </Button>
                </div>

                {/* Rewriter output area */}
                {rewrittenText ? (
                  <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 relative space-y-2 animate-in fade-in-50 duration-200">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs uppercase font-bold text-indigo-400">AI Draft Output</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(rewrittenText)}
                        className="text-slate-400 hover:text-white h-7 px-2"
                      >
                        {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? 'Copied' : 'Copy Draft'}
                      </Button>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-xs whitespace-pre-wrap select-all py-2">
                      {rewrittenText}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    Select a format preset and click &quot;Reformat Note&quot; to transform this voice note using AI.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </ScrollArea>

      {/* Footer Editor Buttons */}
      <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-slate-900/60 z-10">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => actions.handleCancelEdit()}
              className="border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => actions.handleSave()}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => actions.handleStartEdit()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
          >
            Edit Content
          </Button>
        )}
      </div>

    </div>
  );
}
