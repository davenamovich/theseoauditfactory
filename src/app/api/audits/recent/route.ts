import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Public ticker of recently completed audits (host + score only, no personal data).
export async function GET() {
  const audits = await db.audit.findMany({
    where: { status: 'completed' },
    orderBy: { completedAt: 'desc' },
    take: 10,
    select: { shareId: true, host: true, overallScore: true, completedAt: true, industry: true },
  });
  return NextResponse.json({
    audits: audits.map((a) => ({ shareId: a.shareId, host: a.host, score: a.overallScore, completedAt: a.completedAt })),
  });
}
