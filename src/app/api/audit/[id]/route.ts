import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await db.audit.findFirst({
    where: { OR: [{ id }, { shareId: id }] },
    include: { contentJobs: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

  const base = {
    id: audit.id,
    shareId: audit.shareId,
    url: audit.url,
    host: audit.host,
    finalUrl: audit.finalUrl,
    businessName: audit.businessName,
    industry: audit.industry,
    location: audit.location,
    status: audit.status,
    stage: audit.stage,
    progress: audit.progress,
    error: audit.error,
    createdAt: audit.createdAt,
    completedAt: audit.completedAt,
    scores: {
      overall: audit.overallScore,
      technical: audit.technicalScore,
      content: audit.contentScore,
      ai: audit.aiScore,
      local: audit.localScore,
      performance: audit.performanceScore,
    },
    report: audit.status === 'completed' ? audit.report : null,
    contentJobs: audit.contentJobs.map((j) => ({
      id: j.id,
      assetType: j.assetType,
      status: j.status,
      provider: j.provider,
      toolName: j.toolName,
      createdAt: j.createdAt,
    })),
  };
  return NextResponse.json(base, { headers: { 'Cache-Control': 'no-store' } });
}
