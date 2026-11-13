// Adapted from the P&R "bot-phone-showcase" skill (Step 2, framing leg).
// The wall pages set frame-ancestors to P&R's own domains, so third-party
// hosts cannot iframe them directly. This route proxies the page HTML from
// our own origin with a <base> injection so relative assets (song.mp3, etc.)
// keep resolving against the original page path. Only pages that live under
// the showcase feed's own origin are proxied - nothing else.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UPSTREAM = process.env.PNR_SHOWCASE_URL || 'https://bot.plunderandriffle.com/api/showcase/feed';
const UPSTREAM_ORIGIN = new URL(UPSTREAM).origin;
const PAGE_TIMEOUT_MS = 10_000;
const MAX_BYTES = 3_000_000;
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 30;

const pageCache = new Map<string, { at: number; html: string }>();

function injectBase(html: string, pageUrl: string): string {
  // Strip any document-level CSP meta so our proxied response policies apply,
  // then anchor every relative asset to the original page path.
  const cleaned = html.replace(
    /<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi,
    ''
  );
  // The wall's audioscript pages carry their own soundtrack, but the showcase
  // iframe is pointer-events:none, so its pause/mute controls are unreachable.
  // Mute the proxy on load (visuals untouched) - visitors who want the audio
  // experience click through to the page on the wall itself.
  const muteScript =
    '<script>(function(){var p=HTMLMediaElement.prototype.play;' +
    'HTMLMediaElement.prototype.play=function(){try{this.muted=true}catch(e){}return p.apply(this,arguments)};' +
    'document.addEventListener("play",function(e){if(e.target&&e.target.muted===false){try{e.target.muted=true}catch(e){}}},true);})();</script>';
  const baseTag = `<base href="${pageUrl}">${muteScript}`;
  if (/<head[^>]*>/i.test(cleaned)) {
    return cleaned.replace(/<head[^>]*>/i, (match) => `${match}\n${baseTag}`);
  }
  if (/<html[^>]*>/i.test(cleaned)) {
    return cleaned.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${baseTag}</head>`);
  }
  return `${baseTag}\n${cleaned}`;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url') ?? '';
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter.' }, { status: 400 });
  }
  if (target.origin !== UPSTREAM_ORIGIN || target.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only showcase pages from the P&R wall can be proxied.' }, { status: 403 });
  }
  const pageUrl = target.toString();

  const cached = pageCache.get(pageUrl);
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return new NextResponse(cached.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);
  try {
    const res = await fetch(pageUrl, { signal: controller.signal });
    if (!res.ok) throw new Error(`wall page returned HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) throw new Error('wall page too large to proxy');
    const html = injectBase(new TextDecoder('utf-8', { fatal: false }).decode(buffer), pageUrl);

    // Tiny bounded cache so rapid auto-advance cycles do not re-fetch.
    if (pageCache.size >= CACHE_MAX_ENTRIES) {
      const oldest = pageCache.keys().next().value;
      if (oldest !== undefined) pageCache.delete(oldest);
    }
    pageCache.set(pageUrl, { at: now, html });

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'wall page fetch failed';
    return NextResponse.json({ error: message.slice(0, 160) }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
