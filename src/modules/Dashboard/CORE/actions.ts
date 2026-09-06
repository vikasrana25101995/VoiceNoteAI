import { DashboardState } from './hooks';

export class DashboardActions {
  private state: DashboardState;

  constructor(state: DashboardState) {
    this.state = state;
  }

  handleSearchChange(query: string) {
    this.state.setSearchQuery(query);
  }

  handleSelectFolder(folderId: string) {
    // If selected folder is already active, click again to deselect
    if (this.state.selectedFolderId === folderId) {
      this.state.setSelectedFolderId('');
    } else {
      this.state.setSelectedFolderId(folderId);
    }
    this.state.setSelectedTag(''); // Reset tag filter when folder changes
  }

  handleSelectTag(tag: string) {
    // Toggle tag filter on click
    if (this.state.selectedTag === tag) {
      this.state.setSelectedTag('');
    } else {
      this.state.setSelectedTag(tag);
    }
  }

  handleSelectNote(noteId: string | null) {
    this.state.setSelectedNoteId(noteId);
  }

  async handleCreateFolder(name: string, color?: string) {
    if (!name.trim()) return null;
    return await this.state.createFolder(name, color);
  }

  async handleDeleteNote(id: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      await this.state.deleteNote(id);
    }
  }

  async handleToggleTask(id: string, isCompleted: boolean) {
    await this.state.handleToggleTask(id, isCompleted);
  }
}
