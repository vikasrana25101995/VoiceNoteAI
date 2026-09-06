'use client';

import { useVoiceRecorder } from './CORE/hooks';
import { VoiceRecorderActions } from './CORE/actions';
import { REC_STATES } from './CORE/constants';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  Loader2, 
  X, 
  Sparkles 
} from './CORE/imports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onSuccess?: (noteId: string) => void;
  className?: string;
}

export default function VoiceRecorder({ onSuccess, className = '' }: VoiceRecorderProps) {
  const state = useVoiceRecorder(onSuccess);
  const actions = new VoiceRecorderActions(state);

  const { recState, recordingSeconds, audioData, error, setError } = state;

  // Format timer string (e.g. 02:04)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert Uint8Array to bar heights for the visualizer
  const renderVisualizer = () => {
    if (recState !== REC_STATES.RECORDING) return null;
    
    // We display the first 24 frequencies, or 24 zeros if no data is available yet
    const frequencies = audioData.length >= 24 
      ? Array.from(audioData.slice(0, 24)) 
      : Array(24).fill(0);
    
    return (
      <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md mx-auto px-4 bg-muted/20 backdrop-blur-md rounded-2xl border border-muted-foreground/10 overflow-hidden">
        {frequencies.map((val, idx) => {
          // Normalize value to a height percentage between 8% and 100%
          const heightPercent = Math.max(8, Math.min(100, (val / 255) * 100));
          return (
            <div
              key={idx}
              className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75"
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card className={`relative border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Background neon ambient gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center relative z-10">
        
        {/* Error Alert */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="text-xs font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 1. Idle State */}
        {recState === REC_STATES.IDLE && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500" />
              <Button
                onClick={() => actions.handleToggleRecord()}
                size="icon"
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 shadow-lg relative"
              >
                <Mic className="w-10 h-10 text-white animate-pulse" />
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
                Ready to Record
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Click the microphone to start speaking. VoiceNote AI will automatically transcribe and summarize.
              </p>
            </div>
          </div>
        )}

        {/* 2. Recording State */}
        {(recState === REC_STATES.RECORDING || recState === REC_STATES.PAUSED) && (
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center">
              <span className="text-sm uppercase font-semibold tracking-wider text-indigo-400 animate-pulse">
                {recState === REC_STATES.RECORDING ? 'Live Recording' : 'Recording Paused'}
              </span>
              <span className="text-5xl font-extrabold text-white mt-1 font-mono tracking-tight tabular-nums">
                {formatTime(recordingSeconds)}
              </span>
            </div>

            {/* Visualizer container */}
            <div className="w-full h-16 flex items-center justify-center">
              {recState === REC_STATES.RECORDING ? (
                renderVisualizer()
              ) : (
                <div className="text-sm text-slate-500 font-semibold italic animate-pulse">
                  Visualization suspended...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-2">
              {/* Cancel Button */}
              <Button
                onClick={() => actions.handleCancel()}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Pause/Resume Button */}
              <Button
                onClick={() => actions.handlePauseResume()}
                variant="outline"
                size="icon"
                className={`w-16 h-16 rounded-full border border-indigo-500/20 text-white transition-all ${
                  recState === REC_STATES.RECORDING 
                    ? 'bg-indigo-500/10 hover:bg-indigo-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 shadow-lg'
                }`}
              >
                {recState === REC_STATES.RECORDING ? (
                  <Pause className="w-6 h-6 text-indigo-300" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                )}
              </Button>

              {/* Stop & Save Button */}
              <Button
                onClick={() => actions.handleToggleRecord()}
                size="icon"
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 border border-rose-500/20"
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* 3. AI Processing States */}
        {(recState === REC_STATES.TRANSCRIBING || recState === REC_STATES.ANALYZING) && (
          <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center relative">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                {recState === REC_STATES.TRANSCRIBING ? 'AI Transcription' : 'AI Analysis & Indexing'}
              </h4>
              <p className="text-sm text-slate-400 max-w-sm">
                {recState === REC_STATES.TRANSCRIBING 
                  ? 'Converting voice audio to text using OpenAI Whisper model...' 
                  : 'Synthesizing key topics, creating summaries, and indexing database tasks...'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
