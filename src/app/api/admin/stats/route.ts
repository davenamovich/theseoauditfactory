import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMcpStatus } from '@/lib/mcp/client';
import { pnrKeyConfigured } from '@/lib/credentials';
import { getSettings } from '@/lib/config';

export const runtime = 'nodejs';

export function adminKeyValid(req: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY || 'plunder-admin';
  const provided = req.headers.get('x-admin-key') ?? '';
  return provided === expected;
}

export async function GET(req: NextRequest) {
  if (!adminKeyValid(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAudits, todayAudits, monthAudits, completed, failed, avgRows, findingGroups, contentGroups, providerGroups, pnrClicks, topArticles, mcp, keyOk, settings] =
    await Promise.all([
      db.audit.count(),
      db.audit.count({ where: { createdAt: { gte: startOfDay } } }),
      db.audit.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.audit.count({ where: { status: 'completed' } }),
      db.audit.count({ where: { status: 'failed' } }),
      db.audit.aggregate({ where: { overallScore: { not: null } }, _avg: { overallScore: true } }),
      db.auditFinding.groupBy({ by: ['code', 'title', 'category', 'severity'], _count: { code: true }, orderBy: { _count: { code: 'desc' } }, take: 10 }),
      db.contentJob.groupBy({ by: ['assetType', 'status'], _count: { assetType: true } }),
      db.contentJob.groupBy({ by: ['provider'], _count: { provider: true } }),
      db.usageEvent.count({ where: { kind: 'pnr_click' } }),
      db.usageEvent.groupBy({ by: ['ref'], where: { kind: 'article_view', ref: { not: null } }, _count: { ref: true }, orderBy: { _count: { ref: 'desc' } }, take: 8 }),
      getMcpStatus(false),
      pnrKeyConfigured(),
      getSettings(),
    ]);

  const recent = await db.audit.findMany({ orderBy: { createdAt: 'desc' }, take: 15, select: { id: true, host: true, status: true, overallScore: true, createdAt: true, stage: true } });
  const contentJobs = await db.contentJob.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, assetType: true, status: true, provider: true, toolName: true, createdAt: true, auditId: true } });

  return NextResponse.json({
    audits: { total: totalAudits, today: todayAudits, month: monthAudits, completed, failed, avgScore: Math.round(avgRows._avg.overallScore ?? 0) },
    topFindings: findingGroups.map((f) => ({ code: f.code, title: f.title, category: f.category, severity: f.severity, count: f._count.code })),
    content: {
      byTypeStatus: contentGroups.map((g) => ({ assetType: g.assetType, status: g.status, count: g._count.assetType })),
      byProvider: providerGroups.map((g) => ({ provider: g.provider ?? 'unknown', count: g._count.provider })),
      recent: contentJobs,
    },
    pnrClicks,
    topArticles: topArticles.map((a) => ({ slug: a.ref, views: a._count.ref })),
    integrations: {
      mcp: { reachable: mcp.reachable, serverInfo: mcp.serverInfo ?? null, toolCount: mcp.tools.length, error: mcp.error ?? null, tools: mcp.tools.map((t) => t.name) },
      pnrKeyConfigured: keyOk,
      auditEngine: 'SEO Audit Factory engine 1.0 - in-process agents (methodology adapted from claude-seo, MIT)',
      agentRuntime: 'In-process pipeline (external Agent 37 runtime not configured in this deployment)',
    },
    settings,
    recentAudits: recent,
  });
}
