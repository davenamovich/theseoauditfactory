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
      const message =
        err instanceof Error
          ? err.name === 'AbortError'
            ? `Timed out after ${timeoutMs}ms`
            : err.message
          : 'Unknown network error';
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
