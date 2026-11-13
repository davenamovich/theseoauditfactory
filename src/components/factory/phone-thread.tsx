'use client';

// Renders a real generated iMessage thread INSIDE the beveled iPhone.
// Used by the /BEFORE result (the MCP call is "returned in a beveled iPhone")
// and by the offers page when the visitor already generated their thread.

import { useEffect, useRef } from 'react';
import { PhoneFrame, PhoneScreenShell } from './phone-frame';
import { cn } from '@/lib/utils';

export interface PhoneThreadMessage {
  from: 'them' | 'me';
  text: string;
}

interface PhoneThreadProps {
  title: string;
  /** Shell corner tag. "Sample" for canned demos; override for real output. */
  tag?: string;
  messages: PhoneThreadMessage[];
  /** Generated image shown as a photo bubble (before shot). */
  imageUrl?: string;
  imageAlt?: string;
  /** Show an animated "typing" indicator instead of / above the thread. */
  typing?: boolean;
  typingLabel?: string;
  footer?: string;
  className?: string;
}

function TypingDots({ label }: { label?: string }) {
  return (
    <div className="self-start flex items-center gap-2" aria-live="polite">
      <div className="rounded-2xl rounded-bl-sm bg-zinc-800 px-3 py-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
      </div>
      {label && <span className="text-[9px] text-zinc-500 font-mono">{label}</span>}
    </div>
  );
}

export function PhoneThread({
  title,
  tag,
  messages,
  imageUrl,
  imageAlt,
  typing,
  typingLabel,
  footer,
  className,
}: PhoneThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep the newest bubbles in view, like a real conversation.
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, typing, imageUrl]);

  return (
    <PhoneFrame className={className}>
      <PhoneScreenShell title={title} tag={tag}>
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto scroll-slim flex flex-col gap-1.5 pt-1 pr-0.5">
            {imageUrl && (
              <div className="self-end" style={{ maxWidth: '88%' }}>
                <img
                  src={imageUrl}
                  alt={imageAlt ?? 'Generated before shot'}
                  className="rounded-2xl rounded-br-sm border border-white/10 h-36 w-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'me' ? 'self-end' : 'self-start'} style={{ maxWidth: '85%' }}>
                <div
                  className={cn(
                    'rounded-2xl px-3 py-1.5 text-[11px] font-medium leading-snug',
                    m.from === 'me'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-zinc-800 text-zinc-100'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && <TypingDots label={typingLabel} />}
            <div ref={endRef} />
          </div>
          {/* Decorative iMessage input bar */}
          <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5">
            <span className="text-[9px] text-zinc-500 flex-1 font-mono">
              {footer ?? 'iMessage'}
            </span>
            <span className="h-4 w-4 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center text-[8px] text-primary" aria-hidden>
              ↑
            </span>
          </div>
        </div>
      </PhoneScreenShell>
    </PhoneFrame>
  );
}
