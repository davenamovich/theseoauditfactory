// Adapted from the P&R "bot-phone-showcase" skill (Step 1).
// Server-side proxy for the public showcase feed so the browser never hits
// cross-origin issues and we control caching + failure behavior:
//   - live read wins, 60s in-memory cache keeps poll storms off the wall
//   - last-good snapshot is served when the live read is empty/fails
//   - items are whitelisted field-by-field (only https pageUrls are kept)

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UPSTREAM = process.env.PNR_SHOWCASE_URL || 'https://bot.plunderandriffle.com/api/showcase/feed';
const CACHE_TTL_MS = 60_000;
const UPSTREAM_TIMEOUT_MS = 10_000;

export interface ShowcaseItem {
  id: string;
  pageUrl: string;
  title: string;
  format: string;
  handle: string;
  createdAt: number;
  pinned: boolean;
}

interface FeedCache {
  items: ShowcaseItem[];
  source: 'live' | 'snapshot';
  at: number;
}

let lastGood: FeedCache | null = null;

function sanitize(raw: unknown, max: number): ShowcaseItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ShowcaseItem[] = [];
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const pageUrl = typeof rec.pageUrl === 'string' ? rec.pageUrl : '';
    if (!/^https:\/\//i.test(pageUrl)) continue;
    out.push({
      id: typeof rec.id === 'string' ? rec.id.slice(0, 64) : String(out.length),
      pageUrl,
      title: typeof rec.title === 'string' ? rec.title.slice(0, 120) : '',
      format: typeof rec.format === 'string' ? rec.format.slice(0, 40) : 'page',
      handle: typeof rec.handle === 'string' ? rec.handle.slice(0, 60) : '',
      createdAt: typeof rec.createdAt === 'number' ? rec.createdAt : 0,
      pinned: rec.pinned === true,
    });
    if (out.length >= max) break;
  }
  return out;
}

function serveLastGood(at: number, note?: string) {
  if (!lastGood) return null;
  return NextResponse.json({
    items: lastGood.items,
    source: 'snapshot',
    generatedAt: new Date(lastGood.at).toISOString(),
    ...(note ? { note: note.slice(0, 160) } : {}),
  });
}

export async function GET(req: NextRequest) {
  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit') ?? 12) || 12, 1), 60);
  const format = (req.nextUrl.searchParams.get('format') ?? '')
    .replace(/[^a-z0-9,-]/gi, '')
    .slice(0, 200);

  const now = Date.now();
  if (lastGood && now - lastGood.at < CACHE_TTL_MS) {
    return NextResponse.json({
      items: lastGood.items,
      source: lastGood.source,
      generatedAt: new Date(lastGood.at).toISOString(),
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const url = new URL(UPSTREAM);
    url.searchParams.set('limit', String(limit));
    if (format) url.searchParams.set('format', format);
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`showcase feed returned HTTP ${res.status}`);
    const data = (await res.json()) as { items?: unknown; source?: unknown };
    const items = sanitize(data.items, limit);
    if (items.length) {
      lastGood = {
        items,
        source: data.source === 'snapshot' ? 'snapshot' : 'live',
        at: now,
      };
      return NextResponse.json({
        items,
        source: lastGood.source,
        generatedAt: new Date(now).toISOString(),
      });
    }
    // Reachable but empty: never hand the phone a blank feed.
    const fallback = serveLastGood(now, 'wall is quiet right now');
    if (fallback) return fallback;
    return NextResponse.json({ items: [], source: 'empty', generatedAt: new Date(now).toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'showcase feed fetch failed';
    const fallback = serveLastGood(now, message);
    if (fallback) return fallback;
    return NextResponse.json({ items: [], source: 'unreachable', error: message.slice(0, 160) });
  } finally {
    clearTimeout(timer);
  }
}
