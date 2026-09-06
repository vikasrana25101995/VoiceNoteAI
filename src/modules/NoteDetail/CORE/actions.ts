import { NoteDetailState } from './hooks';

export class NoteDetailActions {
  private state: NoteDetailState;

  constructor(state: NoteDetailState) {
    this.state = state;
  }

  handleStartEdit() {
    this.state.setIsEditing(true);
  }

  handleCancelEdit() {
    if (this.state.note) {
      this.state.setEditedTitle(this.state.note.title);
      this.state.setEditedContent(this.state.note.content);
      this.state.setEditedSummary(this.state.note.summary || '');
    }
    this.state.setIsEditing(false);
  }

  async handleSave() {
    await this.state.saveNoteChanges();
  }

  handleTabChange(tab: 'summary' | 'transcript' | 'tasks' | 'rewrite') {
    this.state.setActiveTab(tab);
  }

  handleRewriteModeChange(mode: string) {
    this.state.setRewriteMode(mode);
    this.state.setRewrittenText(''); // Clear output on mode change
  }

  async triggerRewrite(prompt: string) {
    await this.state.handleRewrite(prompt);
  }
}
