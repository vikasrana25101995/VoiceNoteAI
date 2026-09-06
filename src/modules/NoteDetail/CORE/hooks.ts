import { useState, useEffect } from 'react';
import { Note } from './types';
import { noteDetailService } from './services';

export function useNoteDetail(noteId: string | null, onNoteUpdated?: () => void) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'tasks' | 'rewrite'>('summary');
  const [rewriteMode, setRewriteMode] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadNote = async (id: string) => {
    setLoading(true);
    const data = await noteDetailService.fetchNote(id);
    if (data) {
      setNote(data);
      setEditedTitle(data.title);
      setEditedContent(data.content);
      setEditedSummary(data.summary || '');
      setRewrittenText('');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
      setIsEditing(false);
      setActiveTab('summary');
    } else {
      setNote(null);
    }
  }, [noteId]);

  const saveNoteChanges = async () => {
    if (!note) return;
    setSaving(true);
    const updated = await noteDetailService.updateNote(note.id, {
      title: editedTitle,
      content: editedContent,
      summary: editedSummary,
    });
    if (updated) {
      setNote(updated);
      setIsEditing(false);
      if (onNoteUpdated) {
        onNoteUpdated();
      }
    }
    setSaving(false);
  };

  const handleRewrite = async (prompt: string) => {
    if (!note) return;
    setRewriting(true);
    try {
      const text = await noteDetailService.runRewrite(note.id, rewriteMode, prompt);
      setRewrittenText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setRewriting(false);
    }
  };

  return {
    note,
    loading,
    isEditing,
    setIsEditing,
    editedTitle,
    setEditedTitle,
    editedContent,
    setEditedContent,
    editedSummary,
    setEditedSummary,
    activeTab,
    setActiveTab,
    rewriteMode,
    setRewriteMode,
    rewrittenText,
    setRewrittenText,
    rewriting,
    saving,
    loadNote,
    saveNoteChanges,
    handleRewrite
  };
}
export type NoteDetailState = ReturnType<typeof useNoteDetail>;
