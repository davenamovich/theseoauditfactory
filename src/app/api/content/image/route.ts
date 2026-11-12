import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Serves built-in fallback images (stored as base64 in the ContentJob result).
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  const job = await db.contentJob.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const result = (job.result ?? {}) as Record<string, unknown>;
  const base64 = typeof result.base64 === 'string' ? result.base64 : null;
  if (!base64) return NextResponse.json({ error: 'No image on this job' }, { status: 404 });
  const mime = typeof result.mime === 'string' ? result.mime : 'image/png';
  const buffer = Buffer.from(base64, 'base64');
  return new NextResponse(new Uint8Array(buffer), {
    headers: { 'Content-Type': mime, 'Cache-Control': 'private, max-age=86400' },
  });
}
