import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callTool, extractCreative, setMcpApiKey } from '@/lib/mcp/client';
import { resolvePnrApiKey } from '@/lib/credentials';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST: human approves a preview -> start MP4 render (request_mp4, 1-3 min on P&R).
// GET ?jobId=: poll the render status (kind mp4).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const contentJobId = String(body.contentJobId ?? '');
  if (!contentJobId) return NextResponse.json({ error: 'contentJobId required' }, { status: 400 });

  const job = await db.contentJob.findUnique({ where: { id: contentJobId } });
  if (!job || job.provider !== 'pnr-mcp' || job.status !== 'completed') {
    return NextResponse.json({ error: 'No completed P&R preview found for this job.' }, { status: 404 });
  }
  const result = (job.result ?? {}) as Record<string, unknown>;
  const pageUrl = typeof result.pageUrl === 'string' ? result.pageUrl : null;
  if (!pageUrl) return NextResponse.json({ error: 'This job has no preview page to render.' }, { status: 400 });

  const key = await resolvePnrApiKey();
  setMcpApiKey(key);
  const res = await callTool('request_mp4', { pageUrl, wait_seconds: 0 }, 60_000);
  const creative = extractCreative(res.data, res.text);
  if (!res.ok) {
    return NextResponse.json({ error: res.text.slice(0, 400) || 'request_mp4 failed' }, { status: 502 });
  }
  const mp4JobId = creative.jobId;
  if (!mp4JobId) return NextResponse.json({ error: 'Render did not return a job id.', raw: res.text.slice(0, 400) }, { status: 502 });

  const merged = { ...result, mp4JobId, mp4Status: 'rendering' };
  await db.contentJob.update({ where: { id: job.id }, data: { result: merged as object } });
  await db.usageEvent.create({ data: { kind: 'mp4_approve', ref: job.id } as never }).catch(() => undefined);
  return NextResponse.json({ mp4JobId, status: 'rendering' });
}

export async function GET(req: NextRequest) {
  const contentJobId = req.nextUrl.searchParams.get('contentJobId');
  if (!contentJobId) return NextResponse.json({ error: 'contentJobId required' }, { status: 400 });
  const job = await db.contentJob.findUnique({ where: { id: contentJobId } });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const result = (job.result ?? {}) as Record<string, unknown>;
  const mp4JobId = typeof result.mp4JobId === 'string' ? result.mp4JobId : null;
  if (!mp4JobId) return NextResponse.json({ status: 'not_started' });

  const key = await resolvePnrApiKey();
  setMcpApiKey(key);
  const res = await callTool('get_job_status', { kind: 'mp4', jobId: mp4JobId }, 45_000);
  const creative = extractCreative(res.data, res.text);
  const mp4Url = creative.mediaUrls.find((u) => /\.mp4(\?|$)/i.test(u)) ?? (res.text.match(/https?:\/\/\S+\.mp4/i)?.[0] ?? null);
  if (mp4Url) {
    const merged = { ...result, mp4Url, mp4Status: 'done' };
    await db.contentJob.update({ where: { id: job.id }, data: { result: merged as object } });
    return NextResponse.json({ status: 'done', mp4Url });
  }
  if (!res.ok) return NextResponse.json({ status: 'failed', error: res.text.slice(0, 300) });
  return NextResponse.json({ status: 'rendering' });
}
