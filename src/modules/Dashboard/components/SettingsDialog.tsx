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
      <DialogContent className="sm:max-w-[480px] bg-white ring-neutral-200/80 p-6 text-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="gap-1.5 pr-6">
          <DialogTitle className="text-2xl font-serif font-normal tracking-tight text-neutral-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#234B36]" />
            AI Provider Settings
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
            Configure custom API keys to power note transcriptions, AI summaries, and your copilot chat. Keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#234B36] animate-spin" />
            <span className="text-xs text-neutral-500">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-5 my-2">
            {/* OpenAI API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="openai-key" className="text-xs font-semibold text-neutral-700">
                  OpenAI API Key
                </Label>
                {hasSavedOpenAI ? (
                  <span className="text-[10px] border border-emerald-200/80 bg-emerald-50/60 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                    Custom Key Active
                  </span>
                ) : serverHasOpenAIKey ? (
                  <span className="text-[10px] border border-neutral-200 bg-white text-neutral-600 px-2 py-0.5 rounded-full font-semibold">
                    Default Server Key Active
                  </span>
                ) : (
                  <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
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
                  className="h-10 bg-white border-neutral-200 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-[#234B36] focus-visible:border-[#234B36]"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAI(!showOpenAI)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                Used for Whisper transcription, note analysis, and note Copilot chat.
              </p>
            </div>

            {/* Gemini API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="gemini-key" className="text-xs font-semibold text-neutral-700">
                  Google Gemini API Key
                </Label>
                {hasSavedGemini && (
                  <span className="text-[10px] border border-emerald-200/80 bg-emerald-50/60 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
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
                  className="h-10 bg-white border-neutral-200 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-[#234B36] focus-visible:border-[#234B36]"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                For Google Gemini model integrations (optional).
              </p>
            </div>

            {/* Anthropic API Key Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="anthropic-key" className="text-xs font-semibold text-neutral-700">
                  Anthropic Claude API Key
                </Label>
                {hasSavedAnthropic && (
                  <span className="text-[10px] border border-emerald-200/80 bg-emerald-50/60 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
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
                  className="h-10 bg-white border-neutral-200 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-[#234B36] focus-visible:border-[#234B36]"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                For Anthropic Claude model integrations (optional).
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="-mx-6 -mb-6 mt-2 px-6 py-4 bg-[#FAFAF8] border-neutral-200/70 rounded-b-2xl">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl sm:mr-auto cursor-pointer"
          >
            Reset to Defaults
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl shadow-2xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-xs bg-[#234B36] hover:bg-[#1A3A2A] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
