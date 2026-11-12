import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auditId = req.nextUrl.searchParams.get('auditId');
  if (!auditId) return NextResponse.json({ error: 'auditId required' }, { status: 400 });
  // Accept either the internal id or the shareId from share links.
  const audit = await db.audit.findFirst({ where: { OR: [{ id: auditId }, { shareId: auditId }] }, select: { id: true } });
  if (!audit) return NextResponse.json({ jobs: [] });
  const jobs = await db.contentJob.findMany({
    where: { auditId: audit.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json({
    jobs: jobs.map((j) => ({
      id: j.id,
      assetType: j.assetType,
      topic: j.topic,
      status: j.status,
      provider: j.provider,
      toolName: j.toolName,
      creditsNote: j.creditsNote,
      result: j.result,
      error: j.error,
      createdAt: j.createdAt,
      completedAt: j.completedAt,
    })),
  });
}
