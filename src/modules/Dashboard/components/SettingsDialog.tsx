'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, Key, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [openAIKey, setOpenAIKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  const [serverHasOpenAIKey, setServerHasOpenAIKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track saved statuses reactively
  const [hasSavedOpenAI, setHasSavedOpenAI] = useState(false);
  const [hasSavedGemini, setHasSavedGemini] = useState(false);
  const [hasSavedAnthropic, setHasSavedAnthropic] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/settings/status')
        .then((res) => res.json())
        .then((data) => {
          setServerHasOpenAIKey(data.hasOpenAIKey);
        })
        .catch((err) => console.error('Error fetching settings status:', err))
        .finally(() => setLoading(false));

      const savedOpenAI = localStorage.getItem('openai_api_key') || '';
      const savedGemini = localStorage.getItem('gemini_api_key') || '';
      const savedAnthropic = localStorage.getItem('anthropic_api_key') || '';

      setOpenAIKey(savedOpenAI);
      setGeminiKey(savedGemini);
      setAnthropicKey(savedAnthropic);

      setHasSavedOpenAI(!!savedOpenAI);
      setHasSavedGemini(!!savedGemini);
      setHasSavedAnthropic(!!savedAnthropic);
      
      setSaveSuccess(false);
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('openai_api_key', openAIKey.trim());
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    localStorage.setItem('anthropic_api_key', anthropicKey.trim());

    setHasSavedOpenAI(!!openAIKey.trim());
    setHasSavedGemini(!!geminiKey.trim());
    setHasSavedAnthropic(!!anthropicKey.trim());

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onOpenChange(false);
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('anthropic_api_key');

    setOpenAIKey('');
    setGeminiKey('');
    setAnthropicKey('');

    setHasSavedOpenAI(false);
    setHasSavedGemini(false);
    setHasSavedAnthropic(false);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-slate-950/95 border-white/10 p-6 text-white rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Glow styling inside the modal */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
        </div>

        <DialogHeader className="relative z-10 space-y-1.5">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            AI Provider Settings
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-450 leading-relaxed">
            Configure custom API keys to power note transcriptions, AI summaries, and your copilot chat. Keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 relative z-10">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-5 my-4 relative z-10">
            {/* OpenAI API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="openai-key" className="text-xs font-bold text-slate-200">
                  OpenAI API Key
                </Label>
                {hasSavedOpenAI ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    Custom Key Active
                  </span>
                ) : serverHasOpenAIKey ? (
                  <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                    Default Server Key Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Key Required
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAI ? 'text' : 'password'}
                  placeholder={serverHasOpenAIKey ? 'Using server default key' : 'sk-...'}
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="bg-slate-900 border-white/5 pr-10 text-xs text-slate-100 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAI(!showOpenAI)}
                  className="absolute right-3 top-2.5 text-slate-450 hover:text-white transition cursor-pointer"
                >
                  {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Used for Whisper transcription, note analysis, and note Copilot chat.
              </p>
            </div>

            {/* Gemini API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="gemini-key" className="text-xs font-bold text-slate-200">
                  Google Gemini API Key
                </Label>
                {hasSavedGemini && (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    Custom Key Active
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGemini ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="bg-slate-900 border-white/5 pr-10 text-xs text-slate-100 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-2.5 text-slate-450 hover:text-white transition cursor-pointer"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                For Google Gemini model integrations (optional).
              </p>
            </div>

            {/* Anthropic API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="anthropic-key" className="text-xs font-bold text-slate-200">
                  Anthropic Claude API Key
                </Label>
                {hasSavedAnthropic && (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    Custom Key Active
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="anthropic-key"
                  type={showAnthropic ? 'text' : 'password'}
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="bg-slate-900 border-white/5 pr-10 text-xs text-slate-100 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3 top-2.5 text-slate-450 hover:text-white transition cursor-pointer"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                For Anthropic Claude model integrations (optional).
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="relative z-10 flex flex-col-reverse sm:flex-row gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-xs hover:bg-white/5 text-slate-400 hover:text-white rounded-xl border border-white/5 sm:mr-auto cursor-pointer"
          >
            Reset to Defaults
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs border-white/10 hover:bg-white/5 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Keys
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
