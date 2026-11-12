import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/config';
import { enqueueAudit, setConcurrency } from '@/lib/seo/pipeline';
import { normalizeUrl } from '@/lib/seo/fetch';
import { safeHost } from '@/lib/seo/parse';

export const runtime = 'nodejs';

export function clientIpHash(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? 'local';
  const ip = fwd.split(',')[0].trim();
  return createHash('sha256').update(`saf:${ip}`).digest('hex').slice(0, 24);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body.url ?? '').trim();
    if (!url) return NextResponse.json({ error: 'Please enter your website URL.' }, { status: 400 });

    let normalized: string;
    let host: string;
    try {
      normalized = normalizeUrl(url);
      host = safeHost(normalized);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, { status: 400 });
    }

    const settings = await getSettings();
    setConcurrency(settings.auditConcurrency);

    const ipHash = clientIpHash(req);
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const todayCount = await db.audit.count({ where: { ipHash, createdAt: { gte: since } } }).catch(() => 0);
    if (todayCount >= settings.maxAuditsPerIpPerDay) {
      return NextResponse.json(
        { error: `Daily audit limit reached (${settings.maxAuditsPerIpPerDay} per day). Try again tomorrow.` },
        { status: 429 }
      );
    }

    // Cache: a recently completed audit for the same host within the TTL window is reused.
    // force=true (RE-RUN button) skips the cache so progress can be re-measured;
    // the per-IP daily limit still applies.
    const force = Boolean(body.force);
    const ttlMs = force ? 0 : settings.cacheTtlMinutes * 60_000;
    if (ttlMs > 0) {
      const cached = await db.audit.findFirst({
        where: { host, status: 'completed', completedAt: { gte: new Date(Date.now() - ttlMs) } },
        orderBy: { completedAt: 'desc' },
      });
      if (cached) {
        return NextResponse.json({
          id: cached.id,
          shareId: cached.shareId,
          cached: true,
          note: 'We served a recent audit of this site. Re-run later for a fresh crawl.',
        });
      }
    }

    const audit = await db.audit.create({
      data: {
        url: normalized,
        host,
        businessName: strOrNull(body.businessName),
        industry: strOrNull(body.industry),
        location: strOrNull(body.location),
        email: strOrNull(body.email),
        consent: Boolean(body.consent),
        ipHash,
        status: 'queued',
        stage: 'Queued',
      },
    });

    enqueueAudit(audit.id);
    return NextResponse.json({ id: audit.id, shareId: audit.shareId, cached: false });
  } catch (err) {
    console.error('[api/audit] error', err);
    return NextResponse.json({ error: 'Could not start the audit. Please try again.' }, { status: 500 });
  }
}

function strOrNull(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, 200) : null;
}
