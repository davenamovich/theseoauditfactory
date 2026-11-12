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

    // Cache FIRST: if we recently completed this site, always serve it - even
    // when the daily quota is used up. A repeat visit must never dead-end.
    const force = Boolean(body.force);
    const ttlMs = force ? 0 : settings.cacheTtlMinutes * 60_000;
    const ipHash = clientIpHash(req);
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

    // Daily quota (per IP): applies to brand-new audits only, and the copy
    // stays friendly - reports already generated remain viewable.
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const todayCount = await db.audit.count({ where: { ipHash, createdAt: { gte: since } } }).catch(() => 0);
    if (todayCount >= settings.maxAuditsPerIpPerDay) {
      return NextResponse.json(
        {
          error: `You have used all ${settings.maxAuditsPerIpPerDay} free audits for today. Reports you already ran are still available, and fresh audits unlock again tomorrow.`,
          quotaReached: true,
        },
        { status: 429 }
      );
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
