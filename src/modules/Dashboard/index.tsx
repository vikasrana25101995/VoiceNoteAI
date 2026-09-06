'use client';

import { useDashboardState } from './CORE/hooks';
import { DashboardActions } from './CORE/actions';
import { PRESET_FOLDERS, EMPTY_STATE_TITLES, EMPTY_STATE_SUBTITLES } from './CORE/constants';
import { 
  useState,
  Mic, 
  Search, 
  FolderIcon, 
  FolderPlus,
  Calendar, 
  CheckSquare, 
  Plus, 
  Sparkles, 
  Clock,
  Settings,
  MessageSquare,
  Trash2,
  ChevronRight,
  Loader2,
  Folder as FolderPresetIcon,
  Check,
  Menu,
  X
} from './CORE/imports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import VoiceRecorder from '../VoiceRecorder';
import NoteDetail from '../NoteDetail';
import AIChat from '../AIChat';
import SettingsDialog from './components/SettingsDialog';


export default function Dashboard() {
  const state = useDashboardState();
  const actions = new DashboardActions(state);

  const {
    notes,
    folders,
    tasks,
    loading,
    searchQuery,
    selectedFolderId,
    selectedTag,
    selectedNoteId,
    refreshAll,
    setSelectedNoteId,
  } = state;

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Aggregate all unique tags from notes
  const allTags = [...new Set(notes.flatMap(n => n.tags))].slice(0, 15);

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    // Pick a random preset color
    const preset = PRESET_FOLDERS[Math.floor(Math.random() * PRESET_FOLDERS.length)];
    const folder = await actions.handleCreateFolder(newFolderName, preset.color);
    if (folder) {
      setNewFolderName('');
    }
  };

  const handleRecordSuccess = (newNoteId: string) => {
    setIsRecordOpen(false);
    refreshAll();
    setSelectedNoteId(newNoteId); // Automatically open the new note!
  };

  const getFolderColor = (folderId: string | null) => {
    if (!folderId) return 'bg-slate-800 text-slate-400';
    const folder = folders.find(f => f.id === folderId);
    return folder?.color || 'bg-slate-800 text-slate-400';
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="min-h-screen bg-[#07070e] text-white flex relative overflow-hidden font-sans">
      
      {/* Background radial glowing aesthetics */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/15 rounded-full blur-[120px]" />
      </div>

      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5 font-extrabold text-lg text-white">
            <Mic className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            <span>VoiceNote <span className="text-indigo-400">AI</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsRecordOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl"
          >
            <Mic className="w-4 h-4 mr-1" />
            Record
          </Button>
        </div>
      </div>

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-slate-950/60 backdrop-blur-xl flex-col p-6 shrink-0 relative z-30">
        {/* App Logo */}
        <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-white mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-600/15">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span>VoiceNote <span className="text-indigo-400">AI</span></span>
        </div>

        {/* Record Trigger Button */}
        <Button
          onClick={() => setIsRecordOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-600/10 border border-white/10 flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-[1.02]"
        >
          <Mic className="w-4 h-4 text-white animate-pulse" />
          Record Voice Note
        </Button>

        {/* Navigation Categories/Folders */}
        <div className="mt-8 flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Folders</h4>
          <ScrollArea className="flex-1 pr-2">
            <nav className="space-y-1.5">
              {/* All Notes filter */}
              <button
                onClick={() => actions.handleSelectFolder('')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                  selectedFolderId === ''
                    ? 'bg-white/5 text-white border border-white/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderPresetIcon className="w-4 h-4 text-indigo-400" />
                  <span>All Notes</span>
                </div>
                <Badge variant="secondary" className="bg-white/5 text-slate-400 text-[10px]">{notes.length}</Badge>
              </button>

              {/* Unassigned Filter */}
              <button
                onClick={() => actions.handleSelectFolder('unassigned')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                  selectedFolderId === 'unassigned'
                    ? 'bg-white/5 text-white border border-white/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderPresetIcon className="w-4 h-4 text-slate-500" />
                  <span>Unassigned</span>
                </div>
              </button>

              {/* User custom folders */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => actions.handleSelectFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                    selectedFolderId === folder.id
                      ? 'bg-white/5 text-white border border-white/5'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderPresetIcon className="w-4 h-4 text-purple-400" />
                    <span className="truncate max-w-[120px]">{folder.name}</span>
                  </div>
                  {folder._count && (
                    <Badge variant="secondary" className="bg-white/5 text-slate-400 text-[10px]">{folder._count.notes}</Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Folder Creator Input */}
            <form onSubmit={handleCreateFolderSubmit} className="mt-4 px-2 flex items-center gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder..."
                className="h-8 bg-slate-900 border-white/5 text-xs text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
              />
              <Button type="submit" size="icon" className="h-8 w-8 bg-white/5 hover:bg-white/10 text-slate-400 shrink-0">
                <FolderPlus className="w-4 h-4" />
              </Button>
            </form>

            {/* Filter by Tags section */}
            {allTags.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => actions.handleSelectTag(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                        selectedTag === tag
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Settings button */}
        <div className="pt-4 border-t border-white/5 mt-auto">
          <Button
            variant="ghost"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-xl text-slate-450 hover:text-white hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-450" />
            <span>Settings</span>
          </Button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR (Drawer) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-slate-950/95 border-r border-white/5 p-6 flex flex-col text-white">
          <div className="flex items-center gap-2 mb-6">
            <Mic className="w-6 h-6 text-indigo-400" />
            <span className="font-extrabold text-lg text-white">VoiceNote AI</span>
          </div>

          <ScrollArea className="flex-1 pr-2">
            <nav className="space-y-1.5">
              <button
                onClick={() => { actions.handleSelectFolder(''); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  selectedFolderId === '' ? 'bg-white/5 text-white' : 'text-slate-400'
                }`}
              >
                <span>All Notes</span>
                <Badge className="bg-white/5 text-slate-400 text-[10px]">{notes.length}</Badge>
              </button>

              <button
                onClick={() => { actions.handleSelectFolder('unassigned'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center p-2.5 rounded-xl text-xs font-semibold ${
                  selectedFolderId === 'unassigned' ? 'bg-white/5 text-white' : 'text-slate-400'
                }`}
              >
                <span>Unassigned</span>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => { actions.handleSelectFolder(folder.id); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                    selectedFolderId === folder.id ? 'bg-white/5 text-white' : 'text-slate-400'
                  }`}
                >
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </nav>

            {/* Folder Creator Input */}
            <form onSubmit={handleCreateFolderSubmit} className="mt-4 flex items-center gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder..."
                className="h-8 bg-slate-900 border-white/5 text-xs text-white"
              />
              <Button type="submit" size="icon" className="h-8 w-8 bg-white/5 text-slate-400">
                <FolderPlus className="w-4 h-4" />
              </Button>
            </form>
          </ScrollArea>

          {/* Mobile Settings Button */}
          <div className="pt-4 border-t border-white/5 mt-auto">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-xl text-slate-450 hover:text-white hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-450" />
              <span>Settings</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* MAIN CONTAINER (Center Area) */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 pb-16 lg:pb-0 relative z-20">
        
        {/* Top Search & Filter Bar */}
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between gap-4 bg-slate-900/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => actions.handleSearchChange(e.target.value)}
              placeholder="Search note titles, transcripts, or summaries..."
              className="pl-10 bg-slate-900/60 border-white/5 text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsChatOpen(true)}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Copilot
            </Button>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-slate-400 text-sm font-semibold">Syncing database notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">{EMPTY_STATE_TITLES.notes}</h3>
              <p className="text-sm text-slate-400 mt-2">{EMPTY_STATE_SUBTITLES.notes}</p>
              <Button onClick={() => setIsRecordOpen(true)} className="mt-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
                <Mic className="w-4 h-4 mr-1.5 animate-pulse" />
                Record First Note
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Recent Recordings</span>
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/10">
                    {notes.length} notes
                  </Badge>
                </h3>
              </div>

              {/* Notes Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    onClick={() => actions.handleSelectNote(note.id)}
                    className="relative group border border-white/5 bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-md rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.01] hover:border-indigo-500/30"
                  >
                    <CardContent className="p-5 flex flex-col h-full space-y-4">
                      
                      {/* Header details */}
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.handleDeleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 hover:bg-white/5 rounded transition duration-200"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Summary preview */}
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed flex-1">
                        {note.summary || note.content}
                      </p>

                      {/* Info bar at the bottom */}
                      <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-white/5 text-[10px] text-slate-300 font-medium py-0 px-2 border border-white/5">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          {note.duration && (
                            <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                              {formatDuration(note.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* TASKS CHECKLIST (Right Sidebar) */}
      <aside className="hidden xl:flex w-72 border-l border-white/5 bg-slate-950/60 backdrop-blur-xl flex-col p-6 shrink-0 relative z-30">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          AI Extracted Tasks
        </h4>

        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <span className="text-xs italic">{EMPTY_STATE_SUBTITLES.tasks}</span>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2 mt-2">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition"
                >
                  <button
                    onClick={() => actions.handleToggleTask(task.id, !task.isCompleted)}
                    className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition ${
                      task.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {task.isCompleted && <Check className="w-3 h-3 text-slate-950 font-extrabold stroke-[3px]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed truncate-2-lines font-semibold ${
                      task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}>
                      {task.content}
                    </p>
                    {task.note && (
                      <button
                        onClick={() => actions.handleSelectNote(task.noteId)}
                        className="text-[9px] text-indigo-400 hover:underline mt-1 block truncate"
                      >
                        Ref: {task.note.title}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </aside>

      {/* POPUP MODAL: RECORD VOICE NOTE */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/95 border-white/10 p-0 text-white rounded-2xl overflow-hidden">
          <VoiceRecorder onSuccess={handleRecordSuccess} />
        </DialogContent>
      </Dialog>

      {/* SLIDE-OUT PANEL: CHAT COPILOT */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-[350px] sm:w-[450px] bg-slate-950/95 border-l border-white/10 p-0 text-white">
          <AIChat noteId={null} />
        </SheetContent>
      </Sheet>

      {/* SLIDE-OUT PANEL: NOTE INSPECTOR DETAILS */}
      <Sheet open={!!selectedNoteId} onOpenChange={(open) => { if (!open) setSelectedNoteId(null); }}>
        <SheetContent side="right" className="w-full sm:w-[540px] md:w-[640px] bg-slate-950/95 border-l border-white/10 p-0 text-white">
          <NoteDetail 
            noteId={selectedNoteId} 
            onClose={() => setSelectedNoteId(null)}
            onNoteUpdated={refreshAll}
            onDeleteNote={(id) => {
              actions.handleDeleteNote(id);
            }}
          />
        </SheetContent>
      </Sheet>
      {/* POPUP MODAL: SETTINGS */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

    </div>
  );
}
