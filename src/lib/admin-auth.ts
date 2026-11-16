import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

// Keys that unlock the admin dashboard: the Plunder & Riffle key (PNR_MCP_KEY)
// and/or a dedicated ADMIN_KEY. Both come from the server environment only;
// with neither set, the dashboard stays locked (no built-in default key).
function allowedKeys(): string[] {
  return [process.env.PNR_MCP_KEY, process.env.ADMIN_KEY]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k));
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminKeyValid(req: NextRequest): boolean {
  const provided = (req.headers.get('x-admin-key') ?? '').trim();
  if (!provided) return false;
  return allowedKeys().some((k) => safeEqual(provided, k));
}

export function adminKeyConfigured(): boolean {
  return allowedKeys().length > 0;
}
