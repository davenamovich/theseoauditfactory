// Polite HTTP fetcher for the audit engine.
// Respects robots-checked targets, uses a descriptive UA, enforces timeouts and byte caps.

export interface FetchResult {
  ok: boolean;
  status: number | null;
  headers: Record<string, string>;
  body: string | null;
  bytes: number;
  truncated: boolean;
  ttfbMs: number | null;
  totalMs: number | null;
  finalUrl: string;
  redirectChain: string[];
  error?: string;
}

export const AUDIT_UA =
  'Mozilla/5.0 (compatible; SeoAuditFactoryBot/1.0; free-seo-audit-research; +https://www.plunderandriffle.com/whop)';

const MAX_REDIRECTS = 6;

interface FetchOpts {
  timeoutMs?: number;
  maxBytes?: number;
  method?: 'GET' | 'HEAD';
  accept?: string;
}

export async function politeFetch(url: string, opts: FetchOpts = {}): Promise<FetchResult> {
  const { timeoutMs = 14000, maxBytes = 1_500_000, method = 'GET' } = opts;
  const headers: Record<string, string> = {
    'user-agent': AUDIT_UA,
    accept: opts.accept ?? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
  };

  let currentUrl = url;
  const redirectChain: string[] = [];
  const started = Date.now();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let ttfbMs: number | null = null;
    try {
      const res = await fetch(currentUrl, {
        method,
        headers,
        redirect: 'manual',
        signal: controller.signal,
      });
      ttfbMs = Date.now() - started;
      const flat: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        flat[k.toLowerCase()] = v;
      });

      if (res.status >= 300 && res.status < 400) {
        const loc = flat['location'];
        if (loc) {
          let next: URL;
          try {
            next = new URL(loc, currentUrl);
          } catch {
            return failResult(currentUrl, redirectChain, `Invalid redirect target: ${loc}`);
          }
          redirectChain.push(currentUrl);
          currentUrl = next.toString();
          // Drain body to free the socket.
          try {
            await res.arrayBuffer();
          } catch {
            /* ignore */
          }
          clearTimeout(timer);
          continue;
        }
      }

      let bytes = 0;
      let truncated = false;
      const chunks: Uint8Array[] = [];
      if (method === 'GET' && res.body) {
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            bytes += value.byteLength;
            chunks.push(value);
            if (bytes > maxBytes) {
              truncated = true;
              try {
                await reader.cancel();
              } catch {
                /* ignore */
              }
              break;
            }
          }
        }
      } else if (method === 'HEAD') {
        try {
          await res.arrayBuffer();
        } catch {
          /* ignore */
        }
      }

      const buffer = concatChunks(chunks);
      const body = method === 'GET' ? new TextDecoder('utf-8', { fatal: false }).decode(buffer) : null;
      clearTimeout(timer);
      return {
        ok: res.ok,
        status: res.status,
        headers: flat,
        body,
        bytes,
        truncated,
        ttfbMs,
        totalMs: Date.now() - started,
        finalUrl: currentUrl,
        redirectChain,
      };
    } catch (err) {
      clearTimeout(timer);
      let message: string;
      if (controller.signal.aborted) {
        // The abort timer fired - regardless of how undici surfaces it.
        message = `Timed out after ${timeoutMs}ms`;
      } else if (err instanceof Error) {
        // undici wraps the real cause; surface a human-readable reason.
        const cause = err.cause as { code?: string } | undefined;
        const code = cause?.code ?? '';
        if (code === 'ENOTFOUND') message = 'domain name not found (DNS) - the site may not exist';
        else if (code === 'ECONNREFUSED') message = 'connection refused - the server is not accepting requests';
        else if (code === 'ECONNRESET') message = 'connection reset by the server';
        else if (code === 'UND_ERR_SOCKET') message = 'connection closed unexpectedly by the server or network';
        else if (code === 'CERT_HAS_EXPIRED') message = 'TLS certificate has expired';
        else if (code === 'EPROTO') message = 'TLS/protocol error';
        else if (code === 'ETIMEDOUT') message = 'connection timed out';
        else if (code) message = `network error (${code})`;
        else message = err.message || 'network error';
      } else {
        message = 'Unknown network error';
      }
      return failResult(currentUrl, redirectChain, message, Date.now() - started);
    }
  }

  return failResult(currentUrl, redirectChain, 'Too many redirects (6+)');
}

function failResult(
  url: string,
  redirectChain: string[],
  error: string,
  totalMs?: number
): FetchResult {
  return {
    ok: false,
    status: null,
    headers: {},
    body: null,
    bytes: 0,
    truncated: false,
    ttfbMs: null,
    totalMs: totalMs ?? null,
    finalUrl: url,
    redirectChain,
    error,
  };
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

/** Lightweight reachability probe: HEAD first, falls back to a capped GET. */
export async function probeUrl(url: string, timeoutMs = 9000): Promise<FetchResult> {
  const head = await politeFetch(url, { method: 'HEAD', timeoutMs });
  if (head.status !== null && head.status !== 405 && head.status !== 501) return head;
  return politeFetch(url, { timeoutMs, maxBytes: 64 * 1024 });
}

// --- bot-block / challenge detection -----------------------------------------

export interface BotBlockInfo {
  blocked: boolean;
  kind: 'challenge' | 'forbidden' | 'rate-limited' | null;
  detail: string;
}

/** Conservative markers of an interstitial bot-challenge page (checked on 403/503 bodies). */
const CHALLENGE_MARKERS = [
  'challenges.cloudflare.com',
  '__cf_chl_opt',
  'cf-chl-b',
  'just a moment',
  'attention required',
  'cf-browser-verification',
  '_incapsula_resource',
  'captcha-delivery',
  'sucuri cloudproxy',
  'px-captcha',
  'perimeterx',
  'radware',
  'access denied',
];

/**
 * Classify a fetch result as a bot-block when possible. Used so the pipeline can
 * fall back to a limited (honest partial) audit instead of failing outright.
 */
export function detectBotBlock(res: FetchResult): BotBlockInfo {
  const status = res.status;
  if (status === null) return { blocked: false, kind: null, detail: '' };
  const server = (res.headers['server'] ?? '').toLowerCase();
  const mitigated = (res.headers['cf-mitigated'] ?? '').toLowerCase();
  const body = (res.body ?? '').slice(0, 6000).toLowerCase();

  if (status === 429) {
    return { blocked: true, kind: 'rate-limited', detail: 'HTTP 429: the site rate-limited our crawler' };
  }
  if (status === 401) {
    return { blocked: true, kind: 'forbidden', detail: 'HTTP 401: the site requires authentication' };
  }
  if (status === 403 || status === 503) {
    const challenged =
      mitigated.includes('challenge') ||
      CHALLENGE_MARKERS.some((m) => body.includes(m) || server.includes(m));
    if (challenged) {
      return {
        blocked: true,
        kind: 'challenge',
        detail: `HTTP ${status}: the site serves a bot challenge${server ? ` (${server.trim()})` : ''}`,
      };
    }
    return { blocked: true, kind: 'forbidden', detail: `HTTP ${status}: the site refused our crawler` };
  }
  return { blocked: false, kind: null, detail: '' };
}

export function normalizeUrl(raw: string): string {
  let value = raw.trim();
  if (!value) throw new Error('Please enter a website URL.');
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`"${raw}" does not look like a valid website URL.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https websites can be audited.');
  }
  if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
    throw new Error(`"${parsed.hostname}" does not look like a valid website address.`);
  }
  parsed.hash = '';
  return parsed.toString();
}
