import { useState, useEffect } from 'react';
import { Note, Folder, Task } from './types';
import { dashboardService } from './services';

export function useDashboardState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(''); // empty means 'all'
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  const refreshNotes = async () => {
    const data = await dashboardService.fetchNotes(searchQuery, selectedFolderId, selectedTag);
    setNotes(data);
  };

  const refreshFolders = async () => {
    const data = await dashboardService.fetchFolders();
    setFolders(data);
  };

  const refreshTasks = async () => {
    const data = await dashboardService.fetchTasks();
    setTasks(data);
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([refreshNotes(), refreshFolders(), refreshTasks()]);
    setLoading(false);
  };

  // Re-fetch notes when query or filters update
  useEffect(() => {
    const fetchAndFinishLoading = async () => {
      await refreshNotes();
      setLoading(false);
    };
    fetchAndFinishLoading();
  }, [searchQuery, selectedFolderId, selectedTag]);

  // Initial fetch for folders/tasks
  useEffect(() => {
    refreshFolders();
    refreshTasks();
  }, []);

  const createFolder = async (name: string, color?: string) => {
    const newFolder = await dashboardService.createFolder(name, color);
    if (newFolder) {
      await refreshFolders();
    }
    return newFolder;
  };

  const deleteNote = async (id: string) => {
    const success = await dashboardService.deleteNote(id);
    if (success) {
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      await refreshNotes();
      await refreshTasks();
    }
  };

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    const updated = await dashboardService.toggleTask(id, isCompleted);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
    }
  };

  return {
    notes,
    folders,
    tasks,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFolderId,
    setSelectedFolderId,
    selectedTag,
    setSelectedTag,
    selectedNoteId,
    setSelectedNoteId,
    refreshNotes,
    refreshFolders,
    refreshTasks,
    refreshAll,
    createFolder,
    deleteNote,
    handleToggleTask
  };
}
export type DashboardState = ReturnType<typeof useDashboardState>;
