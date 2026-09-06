export const RECORDING_LIMIT_SECONDS = 300; // 5 minutes limit

export const REC_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PAUSED: 'paused',
  TRANSCRIBING: 'transcribing',
  ANALYZING: 'analyzing',
} as const;

export type RecState = typeof REC_STATES[keyof typeof REC_STATES];
