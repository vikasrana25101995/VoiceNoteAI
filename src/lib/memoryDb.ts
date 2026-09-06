export interface Folder {
  id: string;
  name: string;
  color?: string | null;
  createdAt: string;
  _count?: {
    notes: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  bulletPoints?: string | null;
  actionItems?: string | null;
  audioUrl?: string | null;
  duration?: number | null;
  tags: string[];
  userId: string;
  folderId?: string | null;
  folder?: Folder | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  content: string;
  dueDate?: string | null;
  isCompleted: boolean;
  noteId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    title: string;
  } | null;
}

class MemoryDatabase {
  private folders: Folder[] = [
    { id: 'folder-work', name: 'Work', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', createdAt: new Date().toISOString() },
    { id: 'folder-meetings', name: 'Meetings', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', createdAt: new Date().toISOString() },
    { id: 'folder-ideas', name: 'Ideas', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', createdAt: new Date().toISOString() },
  ];

  private notes: Note[] = [
    {
      id: 'note-1',
      title: 'Project Team Sync',
      content: 'Hi, this is a voice note recording from our team sync. We discussed the launch details for VoiceNote AI, using Next.js, shadcn/ui, and PostgreSQL. We need to implement a premium user interface with glassmorphism and smooth animations. Sarah needs to finalize the dashboard components by Wednesday. John needs to complete the database migrations and seeding by Thursday. Also, let\'s schedule our next review session for Friday at 10:00 AM to go over the final walkthrough. Let me know if you have any questions!',
      summary: 'Project team sync discussing the launch of VoiceNote AI. Covers tech stack components, styling guidelines, and individual task deadlines.',
      bulletPoints: 'Discussed the VoiceNote AI launch timeline and system components.\nEmphasized the importance of premium UI/UX design (glassmorphism, micro-animations).\nSet clear deliverables and action items for individual team members.',
      actionItems: 'Sarah to finalize the dashboard components by Wednesday.\nJohn to complete database migrations and seeding by Thursday.\nSchedule review session for Friday at 10:00 AM.',
      tags: ['VoiceNote', 'AI', 'Meeting', 'Sync'],
      duration: 35,
      userId: 'default-user-id',
      folderId: 'folder-meetings',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'note-2',
      title: 'App Design Brainstorm',
      content: 'Explored layout styles including sidebar navigation and expandable folders. Considered adding AI chat functionality for note summaries. Discussed exporting capabilities to PDF, Markdown, and text formats.',
      summary: 'Brainstorm session for layout styles, sidebar navigation, AI chat capabilities, and multi-format note exporting (PDF, Markdown, text).',
      bulletPoints: 'Explored layout styles including sidebar navigation and expandable folders.\nConsidered adding AI chat functionality for note summaries.\nDiscussed exporting capabilities to PDF, Markdown, and text formats.',
      actionItems: 'Create Figma UI layouts for the chat interface.\nResearch local web voice recorder browser constraints.',
      tags: ['Brainstorm', 'Design', 'Ideas'],
      duration: 18,
      userId: 'default-user-id',
      folderId: 'folder-ideas',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ];

  private tasks: Task[] = [
    {
      id: 'task-1',
      content: 'Sarah: Finalize dashboard components',
      isCompleted: false,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      content: 'John: Complete database migrations and seeding',
      isCompleted: false,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      content: 'Schedule review session for Friday',
      isCompleted: true,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      content: 'Create Figma UI layouts',
      isCompleted: false,
      noteId: 'note-2',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  getNotes(search = '', folderId = '', tag = ''): Note[] {
    let filtered = [...this.notes];

    if (folderId === 'unassigned') {
      filtered = filtered.filter(n => !n.folderId);
    } else if (folderId) {
      filtered = filtered.filter(n => n.folderId === folderId);
    }

    if (tag) {
      filtered = filtered.filter(n => n.tags.includes(tag));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q))
      );
    }

    // Attach folders to notes
    return filtered.map(note => ({
      ...note,
      folder: this.folders.find(f => f.id === note.folderId) || null,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getNoteDetail(id: string): Note | null {
    const note = this.notes.find(n => n.id === id);
    if (!note) return null;
    return {
      ...note,
      folder: this.folders.find(f => f.id === note.folderId) || null,
    };
  }

  createNote(data: Partial<Note>): Note {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 11),
      title: data.title || 'Untitled Note',
      content: data.content || '',
      summary: data.summary || null,
      bulletPoints: data.bulletPoints || null,
      actionItems: data.actionItems || null,
      audioUrl: data.audioUrl || null,
      duration: data.duration || null,
      tags: data.tags || [],
      userId: 'default-user-id',
      folderId: data.folderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notes.push(newNote);
    return newNote;
  }

  updateNote(id: string, updates: Partial<Note>): Note | null {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.notes[idx] = {
      ...this.notes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.notes[idx];
  }

  deleteNote(id: string): boolean {
    const lengthBefore = this.notes.length;
    this.notes = this.notes.filter(n => n.id !== id);
    // Cascade delete tasks
    this.tasks = this.tasks.filter(t => t.noteId !== id);
    return this.notes.length < lengthBefore;
  }

  getFolders(): Folder[] {
    return this.folders.map(f => ({
      ...f,
      _count: {
        notes: this.notes.filter(n => n.folderId === f.id).length,
      },
    }));
  }

  createFolder(name: string, color?: string): Folder {
    const existing = this.folders.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      color: color || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      createdAt: new Date().toISOString(),
    };
    this.folders.push(newFolder);
    return newFolder;
  }

  getTasks(): Task[] {
    return this.tasks.map(t => {
      const note = this.notes.find(n => n.id === t.noteId);
      return {
        ...t,
        note: note ? { title: note.title } : null,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createTask(content: string, noteId: string, dueDate?: Date): Task {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11),
      content,
      dueDate: dueDate ? dueDate.toISOString() : null,
      isCompleted: false,
      noteId,
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  toggleTask(id: string, isCompleted: boolean): Task | null {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = {
      ...this.tasks[idx],
      isCompleted,
      updatedAt: new Date().toISOString(),
    };
    return this.tasks[idx];
  }

  deleteTask(id: string): boolean {
    const lengthBefore = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return this.tasks.length < lengthBefore;
  }
}

export const memoryDb = new MemoryDatabase();
