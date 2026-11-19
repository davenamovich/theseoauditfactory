// One place where an audit begins.
//
// Before this, the start flow lived inside `POST /api/audit`. An MCP caller
// needs exactly the same behaviour — the cache-first rule, the per-IP quota,
// the queue, the same errors — and a second copy of those rules would drift
// within a week. So the route and the MCP tool both call `startAudit`.

import { db } from '@/lib/db';
import { getSettings } from '@/lib/config';
import { enqueueAudit, setConcurrency } from './pipeline';
import { normalizeUrl } from './fetch';
import { safeHost } from './parse';

export interface StartAuditInput {
  url: string;
  businessName?: string | null;
  industry?: string | null;
  location?: string | null;
  email?: string | null;
  consent?: boolean;
  /** Who to attribute the quota to: IP hash for the web form, key hash for MCP. */
  ipHash: string;
  force?: boolean;
}

export type StartAuditResult =
  | { ok: true; id: string; shareId: string; cached: boolean; note?: string }
  | { ok: false; status: number; error: string; quotaReached?: boolean };

const strOrNull = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, 200) : null;
};

export async function startAudit(input: StartAuditInput): Promise<StartAuditResult> {
  const raw = String(input.url ?? '').trim();
  if (!raw) return { ok: false, status: 400, error: 'Please enter your website URL.' };

  let normalized: string;
  let host: string;
  try {
    normalized = normalizeUrl(raw);
    host = safeHost(normalized);
  } catch (e) {
    return { ok: false, status: 400, error: e instanceof Error ? e.message : 'Invalid URL' };
  }

  const settings = await getSettings();
  setConcurrency(settings.auditConcurrency);

  // Cache FIRST: a repeat visit must never dead-end, even when the daily quota
  // is spent. A report we already generated is still ours to show.
  const force = Boolean(input.force);
  const ttlMs = force ? 0 : settings.cacheTtlMinutes * 60_000;
  if (ttlMs > 0) {
    const cached = await db.audit.findFirst({
      where: { host, status: 'completed', completedAt: { gte: new Date(Date.now() - ttlMs) } },
      orderBy: { completedAt: 'desc' },
    });
    if (cached) {
      return {
        ok: true,
        id: cached.id,
        shareId: cached.shareId,
        cached: true,
        note: 'We served a recent audit of this site. Re-run later for a fresh crawl.',
      };
    }
  }

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const todayCount = await db.audit
    .count({ where: { ipHash: input.ipHash, createdAt: { gte: since } } })
    .catch(() => 0);
  if (todayCount >= settings.maxAuditsPerIpPerDay) {
    return {
      ok: false,
      status: 429,
      quotaReached: true,
      error: `You have used all ${settings.maxAuditsPerIpPerDay} free audits for today. Reports you already ran are still available, and fresh audits unlock again tomorrow.`,
    };
  }

  const audit = await db.audit.create({
    data: {
      url: normalized,
      host,
      businessName: strOrNull(input.businessName),
      industry: strOrNull(input.industry),
      location: strOrNull(input.location),
      email: strOrNull(input.email),
      consent: Boolean(input.consent),
      ipHash: input.ipHash,
      status: 'queued',
      stage: 'Queued',
    },
  });

  enqueueAudit(audit.id);
  return { ok: true, id: audit.id, shareId: audit.shareId, cached: false };
}

/**
 * Wait for a queued audit to finish, up to `deadlineMs`.
 *
 * The MCP surface is request/response; a member should not have to know that
 * the crawl is a background job. Polling the row is the smallest honest way to
 * give them one call — and if the crawl outlives the deadline we return the id
 * instead of hanging, so the caller can ask again.
 */
export async function awaitAudit(
  idOrShareId: string,
  deadlineMs = 90_000,
  intervalMs = 1_500
): Promise<Awaited<ReturnType<typeof db.audit.findFirst>>> {
  const until = Date.now() + deadlineMs;
  for (;;) {
    const row = await db.audit.findFirst({
      where: { OR: [{ id: idOrShareId }, { shareId: idOrShareId }] },
    });
    if (!row) return null;
    if (row.status === 'completed' || row.status === 'failed') return row;
    if (Date.now() >= until) return row;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
