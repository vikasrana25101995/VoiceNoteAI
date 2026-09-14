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
  FileText,
  Share2,
  MessageSquareShare
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
  onOpenCopilot?: () => void;
}

// Waveform bar height multipliers to mimic realistic audio spectrum
const WAVEFORM_BAR_HEIGHTS = [
  35, 60, 45, 80, 95, 70, 85, 40, 60, 75, 
  90, 65, 45, 80, 100, 85, 70, 50, 65, 80, 
  95, 60, 40, 75, 90, 55, 35, 65, 80, 60, 
  45, 70, 85, 50, 40, 65, 55, 35, 45, 30
];

export default function NoteDetail({ noteId, onClose, onNoteUpdated, onDeleteNote, onOpenCopilot }: NoteDetailProps) {
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
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(188); // Default to ~3:08 to match mockup if note duration exists
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset playback to simulated 3:08 or 0 on note change
    setPlaybackTime(note?.duration ? Math.min(188, note.duration) : 0);
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
      // Simulation fallback for mock notes
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

  const handleWavebarClick = (index: number) => {
    if (!note?.duration) return;
    const fraction = (index + 1) / WAVEFORM_BAR_HEIGHTS.length;
    const newTime = Math.floor(fraction * note.duration);
    setPlaybackTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  if (!noteId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <FileText className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300 dark:text-slate-600" />
        <h4 className="font-bold text-slate-600 dark:text-slate-300 text-lg">No Note Selected</h4>
        <p className="text-sm max-w-xs mt-1 text-slate-400 dark:text-slate-500">Select a note from the dashboard to view summaries, transcripts, and AI tasks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
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

  const copySummaryText = () => {
    if (!note.summary) return;
    navigator.clipboard.writeText(note.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
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

  const formatMinSec = (seconds?: number | null) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const selectedRewritePreset = REWRITE_MODES.find(m => m.id === rewriteMode);
  const durationTotal = note.duration || 752; // default 12m 32s
  const progressRatio = Math.min(1, playbackTime / durationTotal);
  const activeBarCount = Math.floor(progressRatio * WAVEFORM_BAR_HEIGHTS.length);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs relative text-slate-800 dark:text-slate-100">
      
      {/* Scrollable Content Container */}
      <ScrollArea className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Metadata Breadcrumb Line */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{note.folder?.name || 'Meetings'}</span>
              <span>Today, 9:40 AM</span>
              <span>·</span>
              <span>12 min 32 sec</span>
              <span>·</span>
              <span>English</span>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Note Title */}
          <div>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-5"
                placeholder="Enter title..."
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{note.title}</h1>
            )}
          </div>

          {/* Audio Equalizer Playbar (Matching Mockup) */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            {/* Round Purple Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-[#635BFF] hover:bg-[#5249ea] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white text-white" />
              ) : (
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              )}
            </button>

            {/* Time Elapsed Readout */}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono shrink-0 w-9">
              {formatMinSec(playbackTime)}
            </span>

            {/* Animated Wavebar Graphic */}
            <div className="flex-1 h-10 flex items-center justify-between gap-[3px] px-1 cursor-pointer">
              {WAVEFORM_BAR_HEIGHTS.map((heightPercent, idx) => {
                const isActive = idx <= activeBarCount;
                return (
                  <button
                    key={idx}
                    onClick={() => handleWavebarClick(idx)}
                    className="flex-1 flex items-center justify-center h-full group focus:outline-none cursor-pointer"
                  >
                    <span
                      className={`w-full rounded-full transition-all duration-150 ${
                        isActive 
                          ? 'bg-[#635BFF] dark:bg-indigo-400' 
                          : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Total Duration Readout */}
            <span className="text-xs font-semibold text-slate-400 font-mono shrink-0 w-9 text-right">
              {formatMinSec(durationTotal)}
            </span>
          </div>

          {/* Navigation Pill Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => actions.handleTabChange(v as any)} className="w-full">
            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl inline-flex gap-1 mb-4 border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => actions.handleTabChange('summary')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => actions.handleTabChange('transcript')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => actions.handleTabChange('tasks')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tasks
              </button>
            </div>

            {/* TAB CONTENT: SUMMARY (Mockup AI Summary Box) */}
            <TabsContent value="summary" className="mt-0 space-y-5">
              <div className="bg-[#F2F5FE] dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#4338CA] dark:text-indigo-400">
                  AI SUMMARY
                </div>

                {isEditing ? (
                  <Textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="min-h-32 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100"
                  />
                ) : (
                  <>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[14px]">
                      {note.summary || 'The team is one step behind on the dashboard because database migrations aren\'t done. John takes the migrations, Sarah continues on components once seeding lands, and the review moves to Friday to give QA a full day.'}
                    </p>

                    <div className="border-t border-indigo-100/60 dark:border-indigo-900/40 pt-4 space-y-2.5">
                      <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] mt-1.5 shrink-0" />
                        <span>Migrations + seeding are the critical path — everything else waits on them.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] mt-1.5 shrink-0" />
                        <span>Review session moved from Wednesday to Friday 3 PM.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] mt-1.5 shrink-0" />
                        <span>QA gets a full day before the demo; no scope added this sprint.</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySummaryText}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : null}
                  {copiedSummary ? 'Copied summary' : 'Copy summary'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Note link copied to clipboard!');
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Share note
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadMarkdown}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Export tasks
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenCopilot && onOpenCopilot()}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <MessageSquareShare className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Ask about this note
                </Button>
              </div>
            </TabsContent>

            {/* TAB CONTENT: TRANSCRIPT */}
            <TabsContent value="transcript" className="mt-0 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Full Transcript</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(note.content)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white h-7 px-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-sans text-sm"
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-sm whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* TAB CONTENT: TASKS */}
            <TabsContent value="tasks" className="mt-0 space-y-4">
              {note.bulletPoints && (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  <h4 className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">Extracted Action Items</h4>
                  <ul className="space-y-2.5 text-slate-700 dark:text-slate-300 text-sm">
                    {note.bulletPoints.split('\n').filter(Boolean).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>{pt.replace(/^•\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </ScrollArea>

    </div>
  );
}
