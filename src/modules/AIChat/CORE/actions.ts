import { AIChatState } from './hooks';

export class AIChatActions {
  private state: AIChatState;

  constructor(state: AIChatState) {
    this.state = state;
  }

  handleInputChange(text: string) {
    this.state.setInputText(text);
  }

  async handleSend() {
    if (this.state.inputText.trim() && !this.state.isThinking) {
      await this.state.submitQuery(this.state.inputText);
    }
  }

  async handleSelectPrompt(prompt: string) {
    if (!this.state.isThinking) {
      await this.state.submitQuery(prompt);
    }
  }

  handleClear() {
    this.state.clearChat();
  }
}
