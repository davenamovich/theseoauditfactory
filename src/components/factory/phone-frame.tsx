'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function PhoneFrame({
  children,
  className,
  glow = 'teal',
}: {
  children: ReactNode;
  className?: string;
  glow?: 'teal' | 'amber' | 'none';
}) {
  const glowClass =
    glow === 'teal'
      ? 'bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]'
      : glow === 'amber'
        ? 'bg-[color-mix(in_oklab,var(--secondary)_14%,transparent)]'
        : 'bg-transparent';
  return (
    <div className={cn('relative', className)}>
      <div className={cn('absolute -inset-8 rounded-full blur-3xl opacity-70 pointer-events-none', glowClass)} aria-hidden />
      {/* Metal rails */}
      <div className="relative w-[280px] sm:w-[300px] rounded-[2.9rem] bg-gradient-to-b from-zinc-400/90 via-zinc-700 to-zinc-900 p-[2px] phone-bevel select-none">
        <div className="rounded-[2.82rem] bg-gradient-to-b from-zinc-800 via-zinc-950 to-zinc-900 p-[9px]">
          {/* Side buttons */}
          <div className="absolute -left-[2.5px] top-24 h-10 w-[3px] rounded-l bg-gradient-to-b from-zinc-500 to-zinc-700" aria-hidden />
          <div className="absolute -left-[2.5px] top-40 h-14 w-[3px] rounded-l bg-gradient-to-b from-zinc-500 to-zinc-700" aria-hidden />
          <div className="absolute -right-[2.5px] top-36 h-16 w-[3px] rounded-r bg-gradient-to-b from-zinc-500 to-zinc-700" aria-hidden />
          {/* Screen */}
          <div className="relative rounded-[2.4rem] overflow-hidden bg-[#0b0f13] phone-screen border border-white/5">
            {/* Dynamic island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-[16px] w-[74px] rounded-full bg-black z-20 border border-white/8 flex items-center justify-end pr-2" aria-hidden>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
            </div>
            <div className="pt-9 pb-4 px-3 h-[540px] flex flex-col">{children}</div>
          </div>
        </div>
      </div>
      {/* Floor reflection */}
      <div className="mx-auto mt-[-14px] h-8 w-[70%] rounded-[50%] bg-black/60 blur-xl" aria-hidden />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono px-1 pb-1.5">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-1.5 w-3 rounded-[2px] border border-zinc-500">
          <span className="block h-full w-3/4 bg-zinc-400 rounded-[1px]" />
        </span>
      </span>
    </div>
  );
}

export function PhoneScreenShell({ title, tag = 'Sample', children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <>
      <StatusBar />
      <div className="flex items-center gap-1.5 pb-2">
        <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">SF</div>
        <span className="text-[10px] font-semibold tracking-wide text-zinc-200">{title}</span>
        <span className="ml-auto text-[8px] font-mono text-zinc-500 uppercase">{tag}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </>
  );
}
