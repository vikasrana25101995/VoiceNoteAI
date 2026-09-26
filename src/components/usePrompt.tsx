'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  destructive?: boolean; // red confirm button, e.g. for deletes
  confirmOnly?: boolean; // no text field; used by confirm()
}

// Styled, promise-based replacements for window.prompt() and window.confirm():
//   const [ask, promptDialog, confirm] = usePrompt();
//   const name = await ask({ title: 'New category' });                       // trimmed string, or null if cancelled
//   const ok = await confirm({ title: 'Delete this note?', destructive: true }); // true / false
// Render {promptDialog} once in the component.
export function usePrompt() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PromptOptions>({ title: '' });
  const [value, setValue] = useState('');
  const resolveRef = useRef<(value: string | null) => void>(() => {});

  const ask = (opts: PromptOptions) =>
    new Promise<string | null>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
      setValue('');
      setOpen(true);
    });

  const confirm = (opts: Omit<PromptOptions, 'confirmOnly' | 'placeholder'>) =>
    ask({ ...opts, confirmOnly: true }).then((result) => result !== null);

  const close = (result: string | null) => {
    resolveRef.current(result);
    resolveRef.current = () => {};
    setOpen(false);
  };

  const promptDialog = (
    <Dialog open={open} onOpenChange={(next) => !next && close(null)}>
      <DialogContent className="sm:max-w-[420px] bg-white ring-neutral-200/80 p-6 text-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (options.confirmOnly) close('');
            else if (value.trim()) close(value.trim());
          }}
          className="grid gap-4"
        >
          <DialogHeader className="gap-1.5 pr-6">
            <DialogTitle className="text-2xl font-serif font-normal tracking-tight text-neutral-900">
              {options.title}
            </DialogTitle>
            {options.description && (
              <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
                {options.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {!options.confirmOnly && (
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={options.placeholder}
              className="h-10 bg-white border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-[#234B36] focus-visible:border-[#234B36]"
            />
          )}

          <DialogFooter className="-mx-6 -mb-6 mt-2 px-6 py-4 bg-[#FAFAF8] border-neutral-200/70 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => close(null)}
              className="text-xs font-semibold bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl shadow-2xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              autoFocus={options.confirmOnly}
              disabled={!options.confirmOnly && !value.trim()}
              className={`text-xs text-white font-semibold rounded-xl shadow-2xs cursor-pointer ${
                options.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#234B36] hover:bg-[#1A3A2A]'
              }`}
            >
              {options.confirmLabel || 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return [ask, promptDialog, confirm] as const;
}
