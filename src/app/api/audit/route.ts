import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { startAudit } from '@/lib/seo/start-audit';

export const runtime = 'nodejs';

export function clientIpHash(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? 'local';
  const ip = fwd.split(',')[0].trim();
  return createHash('sha256').update(`saf:${ip}`).digest('hex').slice(0, 24);
}

// The start flow lives in lib/seo/start-audit so the MCP surface runs exactly
// the same cache-first, quota-guarded, queued audit as this form.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await startAudit({
      url: String(body.url ?? ''),
      businessName: body.businessName,
      industry: body.industry,
      location: body.location,
      email: body.email,
      consent: Boolean(body.consent),
      force: Boolean(body.force),
      ipHash: clientIpHash(req),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, ...(result.quotaReached ? { quotaReached: true } : {}) },
        { status: result.status }
      );
    }

    return NextResponse.json({
      id: result.id,
      shareId: result.shareId,
      cached: result.cached,
      ...(result.note ? { note: result.note } : {}),
    });
  } catch (err) {
    console.error('[api/audit] error', err);
    return NextResponse.json({ error: 'Could not start the audit. Please try again.' }, { status: 500 });
  }
}
