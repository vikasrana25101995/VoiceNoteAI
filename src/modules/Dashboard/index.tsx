'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Search, 
  Plus, 
  PenTool, 
  CheckSquare, 
  LogOut, 
  Settings, 
  X, 
  Check, 
  Tag as TagIcon,
  Sparkles,
  FileText,
  Bookmark,
  Trash2,
  Volume2
} from 'lucide-react';
import NoteDetail from '../NoteDetail';
import SettingsDialog from './components/SettingsDialog';
import { usePrompt } from '@/components/usePrompt';
import { useDashboardState } from './CORE/hooks';
import { DashboardActions } from './CORE/actions';

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const state = useDashboardState();
  const actions = new DashboardActions(state);
  const [ask, promptDialog, confirm] = usePrompt();

  const {
    notes,
    folders,
    loading,
    searchQuery,
    selectedFolderId,
    setSelectedFolderId,
    selectedTag,
    selectedNoteId,
    refreshAll,
    setSelectedNoteId,
    createFolder,
  } = state;

  const [activeLibraryTab, setActiveLibraryTab] = useState<'all' | 'voice' | 'favourites' | 'trash'>('all');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const createNewNote = async (mode: 'voice' | 'type') => {
    try {
      const isVoice = mode === 'voice';
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: isVoice ? 'New Voice Note' : 'Untitled Note',
          content: '',
          tags: isVoice ? ['VoiceNote'] : [],
          duration: isVoice ? 1 : undefined,
          folderId: selectedFolderId || undefined,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setActiveLibraryTab('all');
        setActiveTagFilter(null);
        setSelectedFolderId('');
        actions.handleSearchChange('');
        await refreshAll();
        setSelectedNoteId(newNote.id);
      }
    } catch (err) {
      console.error('Error creating new note:', err);
    }
  };

  // Dynamically compute counts for Library items
  const allNotesCount = notes.filter((n) => !n.isArchived).length;
  const voiceNotesCount = notes.filter((n) => !n.isArchived && (n.duration || n.type === 'voice')).length;
  const favoriteNotesCount = notes.filter((n) => !n.isArchived && n.isFavorite).length;
  const trashNotesCount = notes.filter((n) => n.isArchived).length;

  // Dynamically compute tags & count per tag
  const tagsMap = new Map<string, number>();
  notes.forEach((n) => {
    if (!n.isArchived && n.tags && Array.isArray(n.tags)) {
      n.tags.forEach((t) => {
        const clean = t.trim();
        if (clean) {
          tagsMap.set(clean, (tagsMap.get(clean) || 0) + 1);
        }
      });
    }
  });
  const dynamicTags = Array.from(tagsMap.entries());
  const tagColors = ['bg-emerald-400', 'bg-amber-400', 'bg-sky-400', 'bg-teal-400', 'bg-purple-400', 'bg-rose-400'];

  // Filter notes based on active library tab, selected folder, and tag filter
  const filteredNotes = notes.filter((n) => {
    if (activeLibraryTab === 'all' && n.isArchived) return false;
    if (activeLibraryTab === 'voice' && (!n.duration || n.isArchived)) return false;
    if (activeLibraryTab === 'favourites' && (!n.isFavorite || n.isArchived)) return false;
    if (activeLibraryTab === 'trash' && !n.isArchived) return false;
    if (selectedFolderId && n.folderId !== selectedFolderId) return false;
    if (activeTagFilter && (!n.tags || !n.tags.includes(activeTagFilter))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.summary && n.summary.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'VN';
  };

  return (
    <div className="h-screen w-screen flex bg-[#FAFAF8] text-neutral-900 font-sans overflow-hidden selection:bg-[#234B36] selection:text-white">
      
      {/* ========================================== */}
      {/* COLUMN 1: FAR LEFT SIDEBAR (DARK GREEN `#132E21`) */}
      {/* ========================================== */}
      <aside className="w-64 bg-[#132E21] text-white flex flex-col justify-between p-5 shrink-0 border-r border-[#1B3E2D] h-full overflow-y-auto">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 pt-1 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#498863] text-white shadow-sm">
              <Mic className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              VoiceNote AI
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {/* Add a note button */}
            <button
              onClick={() => createNewNote('type')}
              className="w-full py-2.5 px-4 bg-[#2C5840] hover:bg-[#34674B] text-white font-medium rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add a note</span>
            </button>
          </div>

          {/* LIBRARY Navigation Section */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-bold tracking-widest text-[#7CA891] uppercase px-2 mb-2">
              LIBRARY
            </div>
            <nav className="space-y-1">
              {/* All notes */}
              <button
                onClick={() => {
                  setActiveLibraryTab('all');
                  setActiveTagFilter(null);
                  setSelectedFolderId('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeLibraryTab === 'all' && !activeTagFilter && !selectedFolderId
                    ? 'bg-[#2C5840] text-white font-semibold'
                    : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                }`}
              >
                <span>All notes</span>
                <span className="text-xs opacity-75 font-mono">{allNotesCount}</span>
              </button>

              {/* Voice notes */}
              <button
                onClick={() => {
                  setActiveLibraryTab('voice');
                  setActiveTagFilter(null);
                  setSelectedFolderId('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeLibraryTab === 'voice'
                    ? 'bg-[#2C5840] text-white font-semibold'
                    : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                }`}
              >
                <span>Voice notes</span>
                <span className="text-xs opacity-75 font-mono">{voiceNotesCount}</span>
              </button>

              {/* Favourites */}
              <button
                onClick={() => {
                  setActiveLibraryTab('favourites');
                  setActiveTagFilter(null);
                  setSelectedFolderId('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeLibraryTab === 'favourites'
                    ? 'bg-[#2C5840] text-white font-semibold'
                    : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                }`}
              >
                <span>Favourites</span>
                <span className="text-xs opacity-75 font-mono">{favoriteNotesCount}</span>
              </button>

              {/* Trash */}
              <button
                onClick={() => {
                  setActiveLibraryTab('trash');
                  setActiveTagFilter(null);
                  setSelectedFolderId('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeLibraryTab === 'trash'
                    ? 'bg-[#2C5840] text-white font-semibold'
                    : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                }`}
              >
                <span>Trash</span>
                <span className="text-xs opacity-75 font-mono">{trashNotesCount}</span>
              </button>
            </nav>
          </div>

          {/* CATEGORIES / FOLDERS Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold tracking-widest text-[#7CA891] uppercase">
                CATEGORIES
              </span>
              <button
                onClick={async () => {
                  const catName = await ask({ title: 'New category', placeholder: 'e.g. Work', confirmLabel: 'Create' });
                  if (catName) {
                    const newFolder = await createFolder(catName);
                    if (newFolder) {
                      setSelectedFolderId(newFolder.id);
                      setActiveLibraryTab('all');
                      setActiveTagFilter(null);
                    }
                  }
                }}
                className="text-[#7CA891] hover:text-white transition-colors"
                title="Create category folder"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <nav className="space-y-1">
              {folders.length === 0 ? (
                <div className="text-xs text-[#A4C4B5]/60 px-3 py-1 font-mono italic">
                  No categories
                </div>
              ) : (
                folders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  const noteCount = folder._count?.notes ?? notes.filter((n) => n.folderId === folder.id).length;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFolderId('');
                        } else {
                          setSelectedFolderId(folder.id);
                          setActiveTagFilter(null);
                          setActiveLibraryTab('all');
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C5840] text-white font-semibold'
                          : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-xs opacity-75 font-mono ml-1">{noteCount}</span>
                    </button>
                  );
                })
              )}
            </nav>
          </div>

          {/* TAGS Navigation Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold tracking-widest text-[#7CA891] uppercase">
                TAGS
              </span>
              <button
                onClick={async () => {
                  const tag = await ask({ title: 'Filter by tag', placeholder: 'e.g. candidly', confirmLabel: 'Filter' });
                  if (tag) setActiveTagFilter(tag);
                }}
                className="text-[#7CA891] hover:text-white transition-colors"
                title="Add tag filter"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <nav className="space-y-1">
              {dynamicTags.length === 0 ? (
                <div className="text-xs text-[#A4C4B5]/60 px-3 py-1 font-mono italic">
                  No tags yet
                </div>
              ) : (
                dynamicTags.map(([tagName, count], idx) => {
                  const colorClass = tagColors[idx % tagColors.length];
                  const isSelected = activeTagFilter === tagName;
                  return (
                    <button
                      key={tagName}
                      onClick={() => {
                        if (isSelected) {
                          setActiveTagFilter(null);
                        } else {
                          setActiveTagFilter(tagName);
                          setSelectedFolderId('');
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C5840] text-white font-semibold'
                          : 'text-[#A4C4B5] hover:bg-[#1C412E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colorClass}`} />
                        <span className="truncate">{tagName}</span>
                      </div>
                      <span className="text-xs opacity-75 font-mono ml-1">{count}</span>
                    </button>
                  );
                })
              )}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="pt-4 border-t border-[#1B3E2D] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-[#27533B] text-[#7BD4A5] font-bold text-xs flex items-center justify-center shrink-0 border border-[#3E7A5A]">
              {getInitials(currentUser?.name, currentUser?.email)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-[11px] text-[#A4C4B5]/80 truncate">
                Free plan
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              className="p-1.5 text-[#A4C4B5] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-[#A4C4B5] hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* COLUMN 2: MIDDLE-LEFT NOTE LIST PANE */}
      {/* ========================================== */}
      <section className="w-80 bg-[#F7F7F4] border-r border-neutral-200/80 flex flex-col shrink-0 h-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200/70 flex items-center justify-between">
          <h2 className="font-bold text-neutral-900 text-sm capitalize">
            {selectedFolderId
              ? folders.find((f) => f.id === selectedFolderId)?.name || 'Category'
              : activeTagFilter
              ? `#${activeTagFilter}`
              : activeLibraryTab === 'all'
              ? 'All notes'
              : activeLibraryTab}
          </h2>
          <span className="text-xs font-medium text-neutral-400">
            {filteredNotes.length} notes
          </span>
        </div>

        {/* Search Bar Input */}
        <div className="p-3 border-b border-neutral-200/60 bg-[#F7F7F4]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => actions.handleSearchChange(e.target.value)}
              placeholder="Search notes"
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#234B36] shadow-2xs"
            />
          </div>
        </div>

        {/* Notes Cards Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto stroke-[1.5] text-neutral-300" />
              <p className="text-xs font-semibold text-neutral-500">No notes found</p>
              <p className="text-[11px] text-neutral-400">
                {searchQuery ? 'Try a different search term' : 'Click "Write a note" or "New voice note" to start'}
              </p>
            </div>
          ) : (
            filteredNotes.map((n) => {
              const isSelected = selectedNoteId === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 group relative ${
                    isSelected
                      ? 'bg-white border-[#234B36] shadow-xs ring-1 ring-[#234B36]/20'
                      : 'bg-white/70 border-neutral-200/70 hover:bg-white hover:border-neutral-300'
                  }`}
                >
                  {/* Title & Delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-1 flex-1">
                      {n.title}
                    </h3>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await confirm({
                          title: 'Delete this note?',
                          description: `"${n.title}" will be permanently deleted. This can't be undone.`,
                          confirmLabel: 'Delete',
                          destructive: true,
                        });
                        if (ok) {
                          actions.handleDeleteNote(n.id);
                          if (selectedNoteId === n.id) {
                            setSelectedNoteId(notes.find((item) => item.id !== n.id)?.id || null);
                          }
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-0.5 rounded cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtitle snippet */}
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-normal">
                    {n.summary || n.content}
                  </p>

                  {/* Metadata Footer: "12 min ago · Voice" */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{formatTimeAgo(n.createdAt)}</span>
                    <span>·</span>
                    <span>{n.duration || n.type === 'voice' ? 'Voice' : 'Written'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* COLUMN 3 & 4: MAIN NOTE CANVAS & ASSISTANT PANEL */}
      {/* ========================================== */}
      <main className="flex-1 flex overflow-hidden min-w-0 bg-[#FAFAF8]">
        <NoteDetail
          noteId={selectedNoteId}
          onNoteUpdated={refreshAll}
          onDeleteNote={async (id) => {
            const ok = await confirm({ title: 'Delete this note?', confirmLabel: 'Delete', destructive: true });
            if (!ok) return;
            actions.handleDeleteNote(id);
            setSelectedNoteId(notes.find((n) => n.id !== id)?.id || null);
          }}
        />
      </main>

      {promptDialog}

      {/* Settings Modal */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}

