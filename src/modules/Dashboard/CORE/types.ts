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
