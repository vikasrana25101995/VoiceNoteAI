import { useState, useEffect, useRef } from 'react';
import { RecState, REC_STATES } from './constants';
import { voiceRecorderService } from './services';

export function useVoiceRecorder(onSuccess?: (noteId: string) => void) {
  const [recState, setRecState] = useState<RecState>(REC_STATES.IDLE);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef(0);

  // Audio Context & Analyser for visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        durationRef.current = next;
        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanUpAudio = () => {
    stopTimer();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanUpAudio();
    };
  }, []);

  const visualize = (stream: MediaStream, audioCtx: AudioContext | null) => {
    if (!audioCtx) return;

    try {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(new Uint8Array(dataArray));
        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error('Audio visualizer failed to initialize:', err);
    }
  };

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    durationRef.current = 0;

    // Pre-create AudioContext synchronously inside user click event handler to satisfy autoplay policy
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    let preCreatedAudioCtx: AudioContext | null = null;
    if (AudioContextClass) {
      try {
        preCreatedAudioCtx = new AudioContextClass();
        if (preCreatedAudioCtx.state === 'suspended') {
          preCreatedAudioCtx.resume();
        }
      } catch (e) {
        console.error('Failed to pre-create AudioContext:', e);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' });
        } catch (e2) {
          mediaRecorder = new MediaRecorder(stream); // Fallback to browser default
        }
      }
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Clean up audio hardware stream and visualizer
        cleanUpAudio();
        // Upload & transcribe the final blob
        await processAudio(audioBlob, durationRef.current);
      };

      mediaRecorder.start(250); // Slice every 250ms
      setRecState(REC_STATES.RECORDING);
      startTimer();
      visualize(stream, preCreatedAudioCtx);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (preCreatedAudioCtx && preCreatedAudioCtx.state !== 'closed') {
        preCreatedAudioCtx.close();
      }
      setError('Could not access microphone. Please check system permissions.');
      setRecState(REC_STATES.IDLE);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recState === REC_STATES.RECORDING) {
      mediaRecorderRef.current.pause();
      setRecState(REC_STATES.PAUSED);
      stopTimer();
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recState === REC_STATES.PAUSED) {
      mediaRecorderRef.current.resume();
      setRecState(REC_STATES.RECORDING);
      startTimer();
      if (audioContextRef.current) {
        audioContextRef.current.resume();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recState === REC_STATES.RECORDING || recState === REC_STATES.PAUSED)) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  };

  const cancelRecording = () => {
    cleanUpAudio();
    setRecState(REC_STATES.IDLE);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const processAudio = async (blob: Blob, duration: number) => {
    setRecState(REC_STATES.TRANSCRIBING);
    try {
      // 1. Upload & Transcribe
      const { text, audioUrl } = await voiceRecorderService.uploadAudio(blob);
      if (!text || text.trim() === '') {
        throw new Error('No speech detected. Please try recording again.');
      }

      // 2. Analyze & Save
      setRecState(REC_STATES.ANALYZING);
      const result = await voiceRecorderService.runAnalysis(text, duration, audioUrl);

      setRecState(REC_STATES.IDLE);
      if (onSuccess && result.note.id) {
        onSuccess(result.note.id);
      }
    } catch (err: any) {
      console.error('Error processing audio:', err);
      setError(err.message || 'Failed to process voice note.');
      setRecState(REC_STATES.IDLE);
    }
  };

  return {
    recState,
    recordingSeconds,
    audioData,
    error,
    setError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
}
export type VoiceRecorderState = ReturnType<typeof useVoiceRecorder>;
