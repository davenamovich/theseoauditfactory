import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const ALLOWED = new Set(['pnr_click', 'article_view', 'glossary_view', 'resources_view', 'mp4_approve', 'agent_prompt_copy']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const kind = String(body.kind ?? '');
  if (!ALLOWED.has(kind)) return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
  await db.usageEvent.create({
    data: {
      kind,
      ref: typeof body.ref === 'string' ? body.ref.slice(0, 200) : null,
      meta: (body.meta && typeof body.meta === 'object' ? body.meta : {}) as object,
    },
  });
  return NextResponse.json({ ok: true });
}
