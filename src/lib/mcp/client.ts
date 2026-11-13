// Plunder & Riffle MCP client — real JSON-RPC 2.0 over Streamable HTTP.
// Endpoint: https://bot.plunderandriffle.com/api/mcp
// Implements: initialize -> notifications/initialized -> tools/list -> tools/call -> get_job_status polling.
// Credentials stay server-side; nothing here is imported into client components.

const ENDPOINT = process.env.PNR_MCP_URL || 'https://bot.plunderandriffle.com/api/mcp';
const PROTOCOL_VERSION = '2025-03-26';

export interface McpToolInfo {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpStatus {
  reachable: boolean;
  serverInfo?: { name?: string; title?: string; version?: string };
  instructions?: string;
  tools: McpToolInfo[];
  checkedAt: string;
  error?: string;
}

export interface McpCallResult {
  ok: boolean;
  isError: boolean;
  text: string;
  data: unknown;
}

let cachedStatus: McpStatus | null = null;
let cachedAt = 0;
let initPromise: Promise<InitState> | null = null;
let sessionId: string | null = null;
let apiKey: string | null = null;

/** Server-side API key for generation calls. Never exposed to the browser. */
export function setMcpApiKey(key: string | null | undefined): void {
  apiKey = key && key.trim() ? key.trim() : null;
}

export function hasMcpApiKey(): boolean {
  return Boolean(apiKey);
}

interface InitState {
  ok: boolean;
  serverInfo?: McpStatus['serverInfo'];
  instructions?: string;
  error?: string;
}

interface JsonRpcResponse {
  jsonrpc?: string;
  id?: number | string;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

async function rawRpc(
  method: string,
  params?: unknown,
  id?: number | string,
  timeoutMs = 45000
): Promise<{ status: number; body: JsonRpcResponse | null; headers: Record<string, string>; raw: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;
    if (id === undefined) headers['MCP-Protocol-Version'] = PROTOCOL_VERSION;
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const payload = id === undefined
      ? { jsonrpc: '2.0', method, params: params ?? {} }
      : { jsonrpc: '2.0', id, method, params: params ?? {} };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k.toLowerCase()] = v;
    });
    const sid = resHeaders['mcp-session-id'];
    if (sid) sessionId = sid;

    const raw = await res.text();
    let body: JsonRpcResponse | null = null;
    if (resHeaders['content-type']?.includes('text/event-stream')) {
      // Parse SSE frames: take the last data: line that parses as JSON-RPC.
      const frames = raw
        .split(/\r?\n\r?\n/)
        .map((f) =>
          f
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim())
            .join('')
        )
        .filter(Boolean);
      for (const frame of frames.reverse()) {
        try {
          body = JSON.parse(frame) as JsonRpcResponse;
          break;
        } catch {
          /* keep looking */
        }
      }
    } else if (raw) {
      try {
        body = JSON.parse(raw) as JsonRpcResponse;
      } catch {
        /* non-JSON body */
      }
    }
    return { status: res.status, body, headers: resHeaders, raw: raw.slice(0, 4000), error: body?.error?.message };
  } catch (err) {
    const message = err instanceof Error ? (err.name === 'AbortError' ? 'MCP request timed out' : err.message) : 'Unknown MCP error';
    return { status: 0, body: null, headers: {}, raw: '', error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function initialize(): Promise<InitState> {
  if (!initPromise) {
    initPromise = (async () => {
      sessionId = null;
      const res = await rawRpc(
        'initialize',
        {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'seo-audit-factory', title: 'The SEO Audit Factory', version: '1.0.0' },
        },
        1
      );
      if (!res.body?.result) {
        return { ok: false, error: res.error ?? res.error ?? `Initialize failed (HTTP ${res.status}) ${res.raw.slice(0, 200)}` };
      }
      const serverInfo = res.body.result.serverInfo as McpStatus['serverInfo'] | undefined;
      const instructions = typeof res.body.result.instructions === 'string' ? res.body.result.instructions : undefined;
      await rawRpc('notifications/initialized');
      return { ok: true, serverInfo, instructions };
    })().catch((e) => ({ ok: false, error: e instanceof Error ? e.message : 'init failed' }));
  }
  return initPromise;
}

async function resetSession(): Promise<void> {
  initPromise = null;
  sessionId = null;
}

export async function getMcpStatus(force = false): Promise<McpStatus> {
  const now = Date.now();
  if (!force && cachedStatus && now - cachedAt < 5 * 60_000) return cachedStatus;
  const init = await initialize();
  if (!init.ok) {
    cachedStatus = { reachable: false, tools: [], checkedAt: new Date().toISOString(), error: init.error };
    cachedAt = now;
    return cachedStatus;
  }
  const res = await rawRpc('tools/list', {}, 2);
  const tools = (res.body?.result?.tools as McpToolInfo[] | undefined) ?? [];
  cachedStatus = {
    reachable: true,
    serverInfo: init.serverInfo,
    instructions: init.instructions?.slice(0, 1200),
    tools: tools.map((t) => ({ name: t.name, title: t.title, description: t.description?.slice(0, 400), inputSchema: t.inputSchema })),
    checkedAt: new Date().toISOString(),
  };
  cachedAt = now;
  return cachedStatus;
}

export async function callTool(
  name: string,
  args: Record<string, unknown>,
  timeoutMs = 120_000
): Promise<McpCallResult> {
  let init = await initialize();
  if (!init.ok) {
    await resetSession();
    init = await initialize();
    if (!init.ok) return { ok: false, isError: true, text: init.error ?? 'P&R MCP unreachable', data: null };
  }
  let res = await rawRpc('tools/call', { name, arguments: args }, undefined, timeoutMs);
  if (res.body?.error && /session/i.test(res.body.error.message)) {
    await resetSession();
    const reinit = await initialize();
    if (reinit.ok) res = await rawRpc('tools/call', { name, arguments: args }, undefined, timeoutMs);
  }
  if (!res.body || res.body.error) {
    return {
      ok: false,
      isError: true,
      text: res.body?.error?.message ?? res.error ?? `MCP call failed (HTTP ${res.status})`,
      data: null,
    };
  }
  const result = res.body.result ?? {};
  const isError = result.isError === true;
  const content = Array.isArray(result.content) ? result.content : [];
  let text = '';
  let parsedData: unknown = result.structuredContent ?? null;
  const textParts: string[] = [];
  for (const item of content) {
    if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>;
      if (rec.type === 'text' && typeof rec.text === 'string') textParts.push(rec.text);
      else if (rec.type === 'resource' && rec.resource) textParts.push(JSON.stringify(rec.resource));
    }
  }
  text = textParts.join('\n\n');
  if (!parsedData && text) {
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = null;
    }
  }
  return { ok: !isError, isError, text, data: parsedData };
}

// ---------------------------------------------------------------------------
// Result shape extraction (the server returns preview pageUrl, PNG urls, copy)
// ---------------------------------------------------------------------------

/** One iMessage-style bubble. "me" = blue side (sender), "them" = grey side. */
export interface ThreadMessage {
  from: 'them' | 'me';
  text: string;
}

export interface CreativeResult {
  pageUrl?: string;
  mediaUrls: string[];
  postCopy?: string;
  referralUrl?: string;
  jobId?: string;
  funnelId?: string;
  jobKind?: string;
  raw: unknown;
  headline?: string;
  caption?: string;
  /** iMessage thread extracted from the creative (demo_pack /before includes one). */
  thread?: ThreadMessage[];
}

const THREAD_KEY_RE = /^(i?messages?|thread|conversation|texts|sms|chat|bubbles)$/i;
const THREAD_TEXT_KEYS = ['text', 'message', 'body', 'content', 'bubble', 'line'];
const THREAD_SENDER_KEYS = ['from', 'sender', 'author', 'role', 'who', 'side', 'mine'];

/**
 * Map an arbitrary array into iMessage bubbles. Accepts plain strings
 * (alternating sides) or objects with text-ish and sender-ish keys.
 * Returns null when the array does not look like a conversation, so error
 * lists or unrelated "messages" arrays are never turned into fake dialogue.
 */
function tryMapThread(arr: unknown[]): ThreadMessage[] | null {
  const objects = arr.filter((i) => i !== null && typeof i === 'object');
  const strings = arr.filter((i) => typeof i === 'string' && i.trim());
  // Strings-only arrays must be long enough to plausibly be a conversation.
  if (objects.length === 0 && strings.length < 4) return null;

  const out: ThreadMessage[] = [];
  let flip = false; // alternates when the item carries no sender info
  for (const item of arr.slice(0, 16)) {
    if (typeof item === 'string') {
      const text = item.trim().slice(0, 280);
      if (!text) continue;
      out.push({ from: flip ? 'me' : 'them', text });
      flip = !flip;
      continue;
    }
    if (item === null || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const rawText = THREAD_TEXT_KEYS.map((k) => rec[k]).find(
      (v) => typeof v === 'string' && v.trim()
    ) as string | undefined;
    if (!rawText) continue;
    const rawSender = THREAD_SENDER_KEYS.map((k) => rec[k]).find(
      (v) => typeof v === 'string' || typeof v === 'boolean'
    );
    let from: 'them' | 'me';
    if (typeof rawSender === 'boolean') {
      from = rawSender ? 'me' : 'them';
    } else if (typeof rawSender === 'string') {
      const s = rawSender.toLowerCase();
      from =
        /\b(me|mine|owner|brand|business|you|joe|us|sent)\b/.test(s) || s === 'true'
          ? 'me'
          : 'them';
      flip = from === 'them'; // keep alternation in sync with explicit senders
    } else {
      from = flip ? 'me' : 'them';
      flip = !flip;
    }
    out.push({ from, text: rawText.trim().slice(0, 280) });
  }
  return out.length >= 2 ? out : null;
}

function collectThread(obj: unknown, out: CreativeResult, depth = 0): void {
  if (depth > 6 || out.thread || obj === null || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) collectThread(item, out, depth + 1);
    return;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (!out.thread && Array.isArray(value) && THREAD_KEY_RE.test(key)) {
      const mapped = tryMapThread(value);
      if (mapped) {
        out.thread = mapped;
        continue;
      }
    }
    collectThread(value, out, depth + 1);
  }
}

function collectFrom(obj: unknown, out: CreativeResult, depth = 0): void {
  if (depth > 6 || obj === null || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) collectFrom(item, out, depth + 1);
    return;
  }
  const rec = obj as Record<string, unknown>;
  for (const [key, value] of Object.entries(rec)) {
    const lower = key.toLowerCase();
    if (typeof value === 'string') {
      if ((lower === 'pageurl' || lower === 'previewurl') && !out.pageUrl) out.pageUrl = value;
      else if (lower === 'post_copy' || lower === 'postcopy') out.postCopy = out.postCopy ? out.postCopy + '\n\n' + value : value;
      else if (lower === 'caption' && !out.caption) out.caption = value;
      else if (lower === 'headline' && !out.headline) out.headline = value;
      else if (lower === 'referralurl' && !out.referralUrl) out.referralUrl = value;
      else if ((lower === 'jobid' || lower === 'funnelid') && !out.jobId) {
        out.jobId = value;
        out.funnelId = lower === 'funnelid' ? value : out.funnelId;
      } else if (lower === 'kind' && !out.jobKind) out.jobKind = value;
      if (/^https?:\/\//.test(value) && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(value) && !out.mediaUrls.includes(value)) {
        out.mediaUrls.push(value);
      }
    } else if (value !== null && typeof value === 'object') {
      if (lower === 'adassets' || lower === 'assets' || lower === 'creatives') {
        collectFrom(value, out, depth + 1);
      } else {
        collectFrom(value, out, depth + 1);
      }
    }
  }
}

export function extractCreative(data: unknown, text: string): CreativeResult {
  const out: CreativeResult = { mediaUrls: [], raw: data ?? text };
  if (data !== null && typeof data === 'object') {
    collectFrom(data, out);
  } else if (typeof data === 'string') {
    try {
      collectFrom(JSON.parse(data), out);
    } catch {
      /* plain text result */
    }
  }
  collectThread(data ?? out.raw, out);
  if (!out.postCopy && text && text.length < 4000 && !out.pageUrl) out.postCopy = text;
  return out;
}

export async function pollJob(kind: string, jobId: string, timeoutMs = 60000): Promise<McpCallResult> {
  return callTool('get_job_status', { kind, jobId }, timeoutMs);
}
