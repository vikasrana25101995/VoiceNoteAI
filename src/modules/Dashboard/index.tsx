'use client';

import { useDashboardState } from './CORE/hooks';
import { DashboardActions } from './CORE/actions';
import { PRESET_FOLDERS } from './CORE/constants';
import { 
  useState,
  useEffect,
  Mic, 
  Search, 
  FolderPlus,
  Plus, 
  Sparkles, 
  Clock,
  Settings,
  MessageSquare,
  Trash2,
  Check,
  Menu,
  X,
  Moon,
  Sun,
  ExternalLink,
  CheckSquare,
  PenTool,
  Edit3,
  LogOut
} from './CORE/imports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import NoteDetail from '../NoteDetail';
import AIChat from '../AIChat';
import SettingsDialog from './components/SettingsDialog';
import CreateNoteModal from './components/CreateNoteModal';

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

  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [createNoteMode, setCreateNoteMode] = useState<'voice' | 'type'>('type');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(true);
  const [taskFilterTab, setTaskFilterTab] = useState<'open' | 'done'>('open');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('Error loading current user:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Set default selected note if none selected
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId, setSelectedNoteId]);

  // Toggle Dark / Light Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const taskContent = newTaskInput.trim();
    setNewTaskInput('');
    await actions.handleCreateTask(
      taskContent,
      selectedNoteId || notes[0]?.id || 'note-1',
      'Today',
      'ME'
    );
  };

  const handleNoteCreateSuccess = (newNoteId: string) => {
    setIsCreateNoteOpen(false);
    refreshAll();
    setSelectedNoteId(newNoteId);
  };

  const openNoteCreator = (mode: 'voice' | 'type') => {
    setCreateNoteMode(mode);
    setIsCreateNoteOpen(true);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFolderDotColor = (folderName?: string) => {
    switch (folderName?.toLowerCase()) {
      case 'meetings': return 'bg-indigo-500';
      case 'action list': return 'bg-rose-500';
      case 'personal': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  const activeTasks = tasks.filter(t => taskFilterTab === 'open' ? !t.isCompleted : t.isCompleted);
  const openCount = tasks.filter(t => !t.isCompleted).length;
  const doneCount = tasks.filter(t => t.isCompleted).length;

  const todayTasks = activeTasks.filter(t => t.dueDate === 'Today');
  const thisWeekTasks = activeTasks.filter(t => t.dueDate !== 'Today');

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#F5F6F8] dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-hidden ${isDarkMode ? 'dark' : ''}`}>

      {/* TOP NAVIGATION BAR */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30">
        
        {/* App Logo */}
        <div className="flex items-center gap-3 w-60">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <Mic className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-[#635BFF] dark:text-indigo-400 tracking-tight">VoiceNote AI</span>
          </div>
        </div>

        {/* Search Bar Input with shortcut pill ⌘K */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => actions.handleSearchChange(e.target.value)}
              placeholder="Search notes, transcripts, people..."
              className="pl-10 pr-12 bg-slate-100/70 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 text-xs rounded-xl h-9 placeholder:text-slate-400 focus-visible:ring-indigo-500"
            />
            <kbd className="absolute right-3 top-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>

          {/* Tasks button toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTasksPanelOpen(!isTasksPanelOpen)}
            className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              isTasksPanelOpen 
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tasks</span>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {openCount}
            </span>
          </Button>

          {/* Ask Copilot trigger pill button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChatOpen(true)}
            className="h-9 px-3.5 rounded-full border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-[#635BFF] dark:text-indigo-400 hover:bg-indigo-100/50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#635BFF] dark:text-indigo-400" />
            <span>Ask Copilot</span>
          </Button>
        </div>
      </header>

      {/* MAIN 4-PANE LAYOUT CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMN 1: LEFT SIDEBAR (Folders & Creation) */}
        <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex-col p-4 shrink-0 justify-between">
          
          <div className="space-y-5">
            
            {/* Primary Action Buttons (Record or Type Note) */}
            <div className="space-y-2">
              <Button
                onClick={() => openNoteCreator('voice')}
                className="w-full bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold h-10 rounded-full shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 text-xs"
              >
                <Mic className="w-3.5 h-3.5 text-white" />
                <span>Record a note</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => openNoteCreator('type')}
                className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold h-9 rounded-full flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <PenTool className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>Type a note</span>
              </Button>
            </div>

            {/* Folders Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">FOLDERS</span>
                <button 
                  onClick={() => {
                    const name = prompt('Folder name:');
                    if (name) actions.handleCreateFolder(name, 'bg-indigo-500');
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <nav className="space-y-1">
                {/* All Notes item */}
                <button
                  onClick={() => actions.handleSelectFolder('')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedFolderId === ''
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#635BFF] dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>All notes</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">{notes.length}</span>
                </button>

                {/* Folders list */}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => actions.handleSelectFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedFolderId === folder.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#635BFF] dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${getFolderDotColor(folder.name)}`} />
                      <span className="truncate max-w-[110px]">{folder.name}</span>
                    </div>
                    {folder._count && (
                      <span className="text-slate-400 text-xs font-medium">{folder._count.notes}</span>
                    )}
                  </button>
                ))}

                {/* Unassigned */}
                <button
                  onClick={() => actions.handleSelectFolder('unassigned')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedFolderId === 'unassigned'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#635BFF] dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>Unassigned</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">0</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Widget: Usage Bar + User Profile */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            {/* Free Usage Bar */}
            <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-xl p-3 space-y-2 border border-slate-200/50 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                10 of 30 free minutes used
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#635BFF] w-[33%] rounded-full" />
              </div>
            </div>

            {/* Profile / Settings Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#234B36] dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser?.name || currentUser?.email || 'User'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  title="Settings"
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* COLUMN 2: MIDDLE-LEFT NOTE LIST PANE */}
        <section className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0">
          
          {/* Note List Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">All notes</h2>
              <span className="text-xs font-medium text-slate-400">{notes.length} notes</span>
            </div>
            
            {/* Quick Type Note Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openNoteCreator('type')}
              className="h-7 px-2 text-xs font-semibold text-[#635BFF] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg flex items-center gap-1 cursor-pointer"
              title="Type a new note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </Button>
          </div>

          {/* Cards List */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2.5">
              {notes.map((note) => {
                const isSelected = selectedNoteId === note.id;
                const folderName = note.folder?.name || 'Meetings';

                return (
                  <div
                    key={note.id}
                    onClick={() => actions.handleSelectNote(note.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-[#635BFF] shadow-sm ring-1 ring-[#635BFF]/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Category dot + Date */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className={`w-2 h-2 rounded-full ${getFolderDotColor(folderName)}`} />
                      <span>{folderName}</span>
                      <span>·</span>
                      <span>Today 9:40</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1">
                      {note.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {note.summary || note.content}
                    </p>

                    {/* Bottom Metadata Badges (Duration + Tasks) */}
                    <div className="flex items-center gap-2 pt-1">
                      {note.duration ? (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {formatDuration(note.duration)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <PenTool className="w-2.5 h-2.5 text-indigo-500" />
                          <span>Typed</span>
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-[#635BFF] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                        {note.actionItems ? `${note.actionItems.split('\n').length} tasks` : '1 task'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </section>

        {/* COLUMN 3: MAIN NOTE DETAIL WORKSPACE */}
        <main className="flex-1 flex flex-col bg-[#F5F6F8] dark:bg-slate-950 p-4 md:p-6 overflow-hidden min-w-0">
          <NoteDetail 
            noteId={selectedNoteId} 
            onNoteUpdated={refreshAll}
            onOpenCopilot={() => setIsChatOpen(true)}
            onDeleteNote={(id) => {
              actions.handleDeleteNote(id);
              setSelectedNoteId(notes.find(n => n.id !== id)?.id || null);
            }}
          />
        </main>

        {/* COLUMN 4: RIGHT TASKS PANEL ("Tasks from your notes") */}
        {isTasksPanelOpen && (
          <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0">
            
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tasks from your notes</h3>
                <p className="text-[11px] text-slate-400 font-medium">{openCount} open · pulled from {notes.length} notes</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTasksPanelOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Add Task Input Form */}
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <form onSubmit={handleCreateTaskSubmit} className="flex items-center gap-2">
                <Input
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add a new task..."
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-8 rounded-xl placeholder:text-slate-400"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-8 w-8 bg-[#635BFF] hover:bg-[#5249ea] text-white shrink-0 rounded-xl cursor-pointer"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Filter Pill Tabs (Open 5 | Done 1) */}
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setTaskFilterTab('open')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  taskFilterTab === 'open'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Open {openCount}
              </button>
              <button
                onClick={() => setTaskFilterTab('done')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  taskFilterTab === 'done'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Done {doneCount}
              </button>
            </div>

            {/* Tasks List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                
                {/* TODAY Tasks */}
                {todayTasks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <span>TODAY</span>
                      <span className="text-slate-400">{todayTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {todayTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 group">
                          {/* Checkbox */}
                          <button
                            onClick={() => actions.handleToggleTask(task.id, !task.isCompleted)}
                            className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                              task.isCompleted
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                            }`}
                          >
                            {task.isCompleted && <Check className="w-3 h-3 stroke-[3px]" />}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className={`text-xs font-semibold leading-snug ${
                              task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {task.content}
                            </p>

                            {/* Reference Link Pill */}
                            <div className="flex items-center justify-between gap-1">
                              <button
                                onClick={() => actions.handleSelectNote(task.noteId)}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded-md truncate max-w-[170px] cursor-pointer"
                              >
                                <span>Today</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span className="truncate">{task.note?.title || 'Observation R...'}</span>
                              </button>

                              {/* User Avatar */}
                              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#635BFF] dark:text-indigo-300 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {task.assignee || 'ME'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THIS WEEK Tasks */}
                {thisWeekTasks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <span>THIS WEEK</span>
                      <span className="text-slate-400">{thisWeekTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {thisWeekTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 group">
                          <button
                            onClick={() => actions.handleToggleTask(task.id, !task.isCompleted)}
                            className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                              task.isCompleted
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                            }`}
                          >
                            {task.isCompleted && <Check className="w-3 h-3 stroke-[3px]" />}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className={`text-xs font-semibold leading-snug ${
                              task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {task.content}
                            </p>

                            <div className="flex items-center justify-between gap-1">
                              <button
                                onClick={() => actions.handleSelectNote(task.noteId)}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded-md truncate max-w-[170px] cursor-pointer"
                              >
                                <span>{task.dueDate || 'Fri'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span className="truncate">{task.note?.title || 'Project Team ...'}</span>
                              </button>

                              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {task.assignee || 'J'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </ScrollArea>
          </aside>
        )}

      </div>

      {/* POPUP MODAL: CREATE NOTE (Voice or Type) */}
      <CreateNoteModal
        open={isCreateNoteOpen}
        onOpenChange={setIsCreateNoteOpen}
        initialMode={createNoteMode}
        folders={folders}
        onSuccess={handleNoteCreateSuccess}
      />

      {/* SLIDE-OUT PANEL: CHAT COPILOT */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-[350px] sm:w-[450px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-0 text-slate-900 dark:text-white">
          <AIChat noteId={selectedNoteId} />
        </SheetContent>
      </Sheet>

      {/* MOBILE SIDEBAR (Drawer) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col text-slate-900 dark:text-white">
          <div className="flex items-center gap-2 mb-6">
            <Mic className="w-6 h-6 text-[#635BFF]" />
            <span className="font-extrabold text-lg text-[#635BFF]">VoiceNote AI</span>
          </div>

          <ScrollArea className="flex-1 pr-2">
            <nav className="space-y-1.5">
              <button
                onClick={() => { actions.handleSelectFolder(''); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  selectedFolderId === '' ? 'bg-indigo-50 text-[#635BFF]' : 'text-slate-600'
                }`}
              >
                <span>All Notes</span>
                <Badge className="bg-slate-100 text-slate-600 text-[10px]">{notes.length}</Badge>
              </button>

              {folders.map((folder) => (
                <button
                  onClick={() => { actions.handleSelectFolder(folder.id); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                    selectedFolderId === folder.id ? 'bg-indigo-50 text-[#635BFF]' : 'text-slate-600'
                  }`}
                >
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* POPUP MODAL: SETTINGS */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

    </div>
  );
}
