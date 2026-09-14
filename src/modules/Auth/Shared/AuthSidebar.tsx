'use client';

import React from 'react';
import { Mic, Check } from 'lucide-react';

interface AuthSidebarProps {
  type: 'login' | 'signup';
}

export const AuthSidebar: React.FC<AuthSidebarProps> = ({ type }) => {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#153424] via-[#1B3E2C] to-[#122A1D] p-8 sm:p-12 lg:p-16 text-white h-full min-h-[600px] lg:min-h-full">
      {/* Background radial glow effect */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#255C41]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#184832]/40 blur-3xl" />

      {/* Top Header Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#498863] text-white shadow-md shadow-black/20">
          <Mic className="h-5 w-5 stroke-[2.5]" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-white/95">
          VoiceNote AI
        </span>
      </div>

      {/* Center Content Section */}
      <div className="relative z-10 my-auto py-12 max-w-md">
        {type === 'login' ? (
          <div>
            <h1 className="text-4xl sm:text-5xl font-normal tracking-tight leading-[1.15] text-white font-serif">
              Say it out loud.{' '}
              <span className="italic block font-normal text-[#B5D7C3] mt-1">
                We&apos;ll write it down.
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A4C4B5]/90 font-normal">
              Record a thought, get a clean editable note seconds later. Type when you&apos;d rather type.
            </p>

            {/* Audio Waveform Equalizer Visualizer (Matching Screenshot 1) */}
            <div className="mt-10 flex items-end gap-1.5 h-10">
              {[40, 65, 90, 75, 100, 85, 60, 95, 70, 50].map((height, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-[#498863] transition-all duration-300 animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 120}ms`,
                    opacity: 0.7 + (i % 3) * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl sm:text-5xl font-normal tracking-tight leading-[1.15] text-white font-serif">
              Start with a thought.{' '}
              <span className="italic block font-normal text-[#B5D7C3] mt-1">
                Not a blank page.
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A4C4B5]/90 font-normal">
              Free to start. No card needed. Your first note can be ten seconds of talking.
            </p>

            {/* Checkmark Feature List (Matching Screenshot 2) */}
            <div className="mt-8 space-y-4">
              {[
                'Voice notes transcribed into clean, editable text',
                'A distraction-free editor that stays out of the way',
                'An AI panel that summarises and pulls out next steps',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#27533B] text-[#7BD4A5] mt-0.5 shadow-inner">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm sm:text-base text-[#D0E5DA]/90 leading-snug">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Social Proof */}
      <div className="relative z-10 pt-4 border-t border-white/10 text-xs sm:text-sm text-[#A4C4B5]/70">
        Trusted by 12,000 writers, students and founders.
      </div>
    </div>
  );
};
