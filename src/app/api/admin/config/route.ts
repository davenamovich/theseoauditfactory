import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, type AppSettings } from '@/lib/config';
import { resolvePnrApiKey, storePnrApiKey } from '@/lib/credentials';

export const runtime = 'nodejs';

function adminKeyValid(req: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY || 'plunder-admin';
  return (req.headers.get('x-admin-key') ?? '') === expected;
}

export async function GET(req: NextRequest) {
  if (!adminKeyValid(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await getSettings();
  const key = await resolvePnrApiKey();
  return NextResponse.json({ settings, pnrKeyConfigured: Boolean(key) });
}

export async function POST(req: NextRequest) {
  if (!adminKeyValid(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Partial<AppSettings> = {};
  for (const key of ['freeContentPerAudit', 'maxAuditsPerIpPerDay', 'auditConcurrency', 'cacheTtlMinutes'] as const) {
    if (body[key] !== undefined) {
      const n = Number(body[key]);
      if (Number.isFinite(n) && n >= 0 && n <= 10000) patch[key] = n;
    }
  }
  if (body.mcpFallbackEnabled !== undefined) patch.mcpFallbackEnabled = Boolean(body.mcpFallbackEnabled);
  const settings = await updateSettings(patch);

  let pnrKeyConfigured: boolean | undefined;
  if (body.pnrApiKey !== undefined) {
    await storePnrApiKey(typeof body.pnrApiKey === 'string' && body.pnrApiKey.trim() ? body.pnrApiKey : null);
    pnrKeyConfigured = Boolean(await resolvePnrApiKey());
  }

  return NextResponse.json({ ok: true, settings, pnrKeyConfigured });
}
