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
  todos?: string | null;
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
  assignee?: string | null;
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
    { id: 'folder-meetings', name: 'Meetings', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', createdAt: new Date().toISOString() },
    { id: 'folder-action-list', name: 'Action list', color: 'bg-rose-500/10 text-rose-600 border-rose-200', createdAt: new Date().toISOString() },
    { id: 'folder-personal', name: 'Personal', color: 'bg-purple-500/10 text-purple-600 border-purple-200', createdAt: new Date().toISOString() },
  ];

  private notes: Note[] = [
    {
      id: 'note-1',
      title: 'Investor update — September',
      content: 'Revenue is up 18% month over month, which puts us slightly ahead of the plan we shared in July. Churn held flat at 2.1% — not moving, but not getting worse either.\n\nThe thing I keep coming back to is hiring. We need two more people on the transcription team before Q4 or the accuracy work slips into next year, and that pushes the enterprise conversations out with it.\n\nOn pricing: the team wants to test a usage-based tier for heavy voice users. I\'d rather wait until we have a full quarter of retention data on the current plans before we complicate the page.',
      summary: 'Growth is ahead of plan at 18% MoM with flat churn. The binding constraint is transcription hiring before Q4; a usage-based pricing test is proposed but deferred pending retention data.',
      bulletPoints: '• Open two transcription roles before Q4\n• Pull a full quarter of retention data\n• Hold the usage-based pricing test until October',
      actionItems: 'Open two transcription roles before Q4\nPull a full quarter of retention data\nHold the usage-based pricing test until October',
      tags: ['Work'],
      duration: 752,
      userId: 'default-user-id',
      folderId: 'folder-meetings',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      title: 'Observation Regarding Pinku\'s Mistake',
      content: 'A note to myself about the invoice mix-up and how to close the loop without making Pinku uncomfortable. We need to double-check the totals and confirm accounting entries.',
      summary: 'A note to myself about the invoice mix-up and how to close the loop without making Pinku feel awkward.',
      bulletPoints: '• Invoice totals need follow-up with Pinku.\n• Keep discussion constructive and loop closed.',
      actionItems: 'Follow up with Pinku about the invoice totals',
      tags: ['Action list', 'Invoices'],
      duration: 184, // 3m 04s
      userId: 'default-user-id',
      folderId: 'folder-action-list',
      createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // Today 8:15 AM
      updatedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    },
    {
      id: 'note-3',
      title: 'Northwind renewal call',
      content: 'They\'ll renew for a year if SSO ships by Q4. Pricing is settled; procurement needs a security overview.',
      summary: 'They\'ll renew for a year if SSO ships by Q4. Pricing is settled; procurement needs a security overview.',
      bulletPoints: '• SSO shipping in Q4 is essential for renewal.\n• Pricing is locked; send security compliance overview.',
      actionItems: 'Send security overview to Northwind procurement',
      tags: ['Meetings', 'Sales', 'Enterprise'],
      duration: 1446, // 24m 06s
      userId: 'default-user-id',
      folderId: 'folder-meetings',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'note-4',
      title: 'Idea: offline-first transcription',
      content: 'Half my recording happens on the train with no signal. Queue locally, transcribe offline when disconnected, and sync with server once online.',
      summary: 'Half my recording happens on the train with no signal. Queue locally, transcribe offline.',
      bulletPoints: '• Queue recordings locally when offline.\n• Transcribe via local AI or background sync when reconnected.',
      actionItems: 'Explore offline web transcription libraries',
      tags: ['Personal', 'Product', 'Ideas'],
      duration: 101, // 1m 41s
      userId: 'default-user-id',
      folderId: 'folder-personal',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Mon
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    }
  ];

  private tasks: Task[] = [
    {
      id: 'task-1',
      content: 'Follow up with Pinku about the invoice totals',
      dueDate: 'Today',
      assignee: 'P',
      isCompleted: false,
      noteId: 'note-2',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      content: 'Send security overview to Northwind procurement',
      dueDate: 'Today',
      assignee: 'ME',
      isCompleted: false,
      noteId: 'note-3',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      content: 'John: complete database migrations and seeding',
      dueDate: 'Thu',
      assignee: 'J',
      isCompleted: false,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      content: 'Move review session to Friday 3 PM',
      dueDate: 'Fri',
      assignee: 'ME',
      isCompleted: false,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      content: 'Sarah: finalize dashboard components',
      dueDate: 'Next week',
      assignee: 'S',
      isCompleted: false,
      noteId: 'note-1',
      userId: 'default-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      content: 'Review previous sprint retrospective',
      dueDate: 'Done',
      assignee: 'ME',
      isCompleted: true,
      noteId: 'note-1',
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
