import type { Metadata } from 'next';
import { Sora, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  title: 'VoiceNote AI - Speak your thoughts, organize with AI',
  description: 'A premium voice-first note-taking SaaS application that automatically transcribes, summarizes, and categorizes your thoughts with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${instrumentSerif.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-neutral-900 font-sans" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
