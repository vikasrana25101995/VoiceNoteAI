import { VoiceRecorderState } from './hooks';
import { REC_STATES } from './constants';

export class VoiceRecorderActions {
  private state: VoiceRecorderState;

  constructor(state: VoiceRecorderState) {
    this.state = state;
  }

  handleToggleRecord() {
    const { recState } = this.state;
    if (recState === REC_STATES.IDLE) {
      this.state.startRecording();
    } else if (recState === REC_STATES.RECORDING || recState === REC_STATES.PAUSED) {
      this.state.stopRecording();
    }
  }

  handlePauseResume() {
    const { recState } = this.state;
    if (recState === REC_STATES.RECORDING) {
      this.state.pauseRecording();
    } else if (recState === REC_STATES.PAUSED) {
      this.state.resumeRecording();
    }
  }

  handleCancel() {
    if (confirm('Cancel recording? Current progress will be discarded.')) {
      this.state.cancelRecording();
    }
  }
}
