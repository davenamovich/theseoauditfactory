'use client';

// Adapted from the P&R "bot-phone-showcase" skill (Step 2).
// The self-updating showcase phone: fetches the recent-creations feed through
// our server proxy, loads each page in an iframe inside the beveled iPhone,
// auto-advances on a dwell timer, and re-fetches the feed every 60s so new
// creations appear without a restart. Failure behavior follows the skill:
// the phone is never blank — last items are kept on fetch errors, and a
// clearly-labeled fallback fills the screen until the first real feed lands.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { PhoneFrame, PhoneScreenShell } from './phone-frame';
import { cn } from '@/lib/utils';

interface ShowcaseItem {
  id: string;
  pageUrl: string;
  title: string;
  format: string;
  handle: string;
  createdAt: number;
  pinned: boolean;
}

const DEFAULT_FORMATS = ''; // '' = every format on the wall (the skill: "remove the param to show everything")
const DWELL_MS = 8000;
const REFRESH_MS = 60_000;

type FeedSource = 'loading' | 'live' | 'snapshot' | 'empty' | 'unreachable';

const SOURCE_LABEL: Record<Exclude<FeedSource, 'loading'>, string> = {
  live: 'Live wall',
  snapshot: 'Last-good snapshot',
  empty: 'Wall is quiet',
  unreachable: 'Wall offline - showing sample',
};

export function ShowcasePhone({
  limit = 12,
  formats = DEFAULT_FORMATS,
  dwellMs = DWELL_MS,
  fallback,
  className,
}: {
  limit?: number;
  formats?: string;
  dwellMs?: number;
  /** Rendered inside the phone until the first real feed arrives (never blank). */
  fallback?: ReactNode;
  className?: string;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [source, setSource] = useState<FeedSource>('loading');
  const [current, setCurrent] = useState(0);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const itemsRef = useRef<ShowcaseItem[]>([]);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = useCallback(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (refreshRef.current) clearInterval(refreshRef.current);
    advanceRef.current = null;
    refreshRef.current = null;
  }, []);

  useEffect(() => stopTimers, [stopTimers]);

  // Hoisted so the advance timer can re-enter it (no TDZ / memoization churn).
  // Reads itemsRef.current, so it is always in sync with the freshest feed.
  function goTo(index: number): void {
    const list = itemsRef.current;
    if (!list.length) return;
    const next = ((index % list.length) + list.length) % list.length;
    setCurrent(next);
    setActiveUrl(list[next].pageUrl);
    if (advanceRef.current) clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => goTo(next + 1), dwellMs);
  }

  const fetchFeed = useCallback(async () => {
    try {
      const formatQuery = formats ? `&format=${encodeURIComponent(formats)}` : '';
      const res = await fetch(`/api/showcase/feed?limit=${limit}${formatQuery}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as { items?: ShowcaseItem[]; source?: string };
      const next = Array.isArray(data.items) ? data.items : [];
      if (next.length) {
        itemsRef.current = next;
        setItems(next);
        setSource(data.source === 'snapshot' ? 'snapshot' : 'live');
        // Don't restart the loop — the next advance picks up new pages.
        if (!activeUrl) goTo(0);
        else if (current >= next.length) goTo(0);
      } else {
        setSource(itemsRef.current.length ? 'live' : 'empty');
      }
    } catch {
      // Keep the last set (skill rule: the phone is never blank).
      setSource((prev) => (itemsRef.current.length ? prev : 'unreachable'));
    }
  }, [limit, formats, activeUrl, current]);

  useEffect(() => {
    let alive = true;
    const start = async () => {
      await fetchFeed();
      if (!alive) return;
      refreshRef.current = setInterval(fetchFeed, REFRESH_MS);
    };
    void start();
    return () => {
      alive = false;
      if (refreshRef.current) clearInterval(refreshRef.current);
      refreshRef.current = null;
    };
    // Initial wiring only; polling continues for the lifetime of the mount.
  }, []);

  const item = items[current];
  const hasFeed = items.length > 0;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <PhoneFrame>
        <PhoneScreenShell title="The wall · Plunder &amp; Riffle" tag={hasFeed ? 'Live' : 'Sample'}>
          {hasFeed ? (
            <div className="relative h-full">
              <iframe
                // Wall pages set frame-ancestors to P&R's own domains, so we
                // load them through our /api/showcase/page proxy (base-tag
                // injection keeps relative assets on the original path).
                src={activeUrl ? `/api/showcase/page?url=${encodeURIComponent(activeUrl)}` : 'about:blank'}
                title={item ? `${item.title || item.format} - live P&R creation` : 'Live P&R creation'}
                className="h-full w-full border-none bg-white"
                // The showcase is a look-but-don't-touch surface: keep pointer
                // events off the iframe so it never captures the outer page.
                style={{ pointerEvents: 'none' }}
                // Opaque origin on purpose: the proxied page is same-origin,
                // so scripts must not be able to touch our storage or DOM.
                sandbox="allow-scripts allow-popups"
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#0b0f13] to-transparent" aria-hidden />
            </div>
          ) : source === 'loading' ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-[10px] font-mono uppercase tracking-widest">Tuning to the wall...</p>
            </div>
          ) : (
            fallback ?? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
                <Radio className="h-5 w-5 text-secondary" aria-hidden />
                <p className="text-[11px] font-black text-zinc-100">THE WALL IS QUIET RIGHT NOW</p>
                <p className="text-[9px] text-zinc-500 leading-relaxed">
                  Fresh creations from the live P&amp;R engine appear here automatically.
                </p>
              </div>
            )
          )}
        </PhoneScreenShell>
      </PhoneFrame>

      {/* Progress dots + title, exactly like the skill's showcase embed */}
      {hasFeed && (
        <>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-[300px]" role="tablist" aria-label="Showcase pages">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Show page ${i + 1}: ${it.title || it.format}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current ? 'w-5 bg-primary' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] font-semibold text-zinc-300 max-w-[300px] leading-snug">
            {item?.title || item?.format}
          </p>
          <p className="mt-0.5 text-center text-[10px] text-zinc-500">
            {item?.handle ? `${item.handle} · ` : ''}
            {item?.format}
            {item?.pinned ? ' · pinned' : ''}
          </p>
        </>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1.5" aria-live="polite">
        <Radio className="h-3 w-3 text-secondary shrink-0" aria-hidden />
        {source === 'loading' ? 'Connecting to the live wall...' : SOURCE_LABEL[source]}
      </p>
    </div>
  );
}
