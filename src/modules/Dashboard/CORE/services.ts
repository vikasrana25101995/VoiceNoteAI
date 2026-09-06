import { Note, Folder, Task } from './types';

export class DashboardService {
  async fetchNotes(search = '', folderId = '', tag = ''): Promise<Note[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (folderId) params.append('folderId', folderId);
      if (tag) params.append('tag', tag);

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      return res.json();
    } catch (error) {
      console.error('Service error fetching notes:', error);
      return [];
    }
  }

  async fetchFolders(): Promise<Folder[]> {
    try {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    } catch (error) {
      console.error('Service error fetching folders:', error);
      return [];
    }
  }

  async fetchTasks(): Promise<Task[]> {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    } catch (error) {
      console.error('Service error fetching tasks:', error);
      return [];
    }
  }

  async createFolder(name: string, color?: string): Promise<Folder | null> {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error('Failed to create folder');
      return res.json();
    } catch (error) {
      console.error('Service error creating folder:', error);
      return null;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete note');
      return true;
    } catch (error) {
      console.error('Service error deleting note:', error);
      return false;
    }
  }

  async toggleTask(id: string, isCompleted: boolean): Promise<Task | null> {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error('Failed to toggle task');
      return res.json();
    } catch (error) {
      console.error('Service error toggling task:', error);
      return null;
    }
  }
}
export const dashboardService = new DashboardService();
