import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pollJob, extractCreative, setMcpApiKey } from '@/lib/mcp/client';
import { resolvePnrApiKey } from '@/lib/credentials';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RUN_TIMEOUT_MS = 8 * 60 * 1000;

// Poll a content job. For async P&R jobs, this lazily polls get_job_status
// against the live MCP server (the MCP guidance is to poll every 20-30s;
// we cache the poll result server-side so browser refreshes do not spam it).
const lastPoll = new Map<string, { at: number; payload: unknown }>();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await db.contentJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  if (job.status !== 'running') {
    return NextResponse.json(serialize(job.status, job.provider, job.toolName, job.result, job.error, job.creditsNote, job.createdAt, job.completedAt));
  }

  const result = (job.result ?? {}) as Record<string, unknown>;
  const kind = typeof result.jobKind === 'string' ? result.jobKind : null;
  const remoteJobId = typeof result.jobId === 'string' ? result.jobId : null;

  if (!kind || !remoteJobId || job.provider !== 'pnr-mcp') {
    // No remote job to poll: mark as failed rather than spinning forever.
    await db.contentJob.update({
      where: { id: job.id },
      data: { status: 'failed', error: 'No pollable job reference; the generation did not return a job id.', completedAt: new Date() },
    });
    return NextResponse.json(
      serialize('failed', job.provider, job.toolName, job.result, 'No pollable job reference.', job.creditsNote, job.createdAt, new Date())
    );
  }

  const cached = lastPoll.get(job.id);
  const now = Date.now();
  const startedAt = job.createdAt.getTime();
  if (now - startedAt > RUN_TIMEOUT_MS) {
    await db.contentJob.update({ where: { id: job.id }, data: { status: 'failed', error: 'Generation timed out (8 min).', completedAt: new Date() } });
    return NextResponse.json(serialize('failed', job.provider, job.toolName, job.result, 'Generation timed out (8 min).', job.creditsNote, job.createdAt, new Date()));
  }
  if (cached && now - cached.at < 12_000) {
    return NextResponse.json(cached.payload);
  }

  const key = await resolvePnrApiKey();
  setMcpApiKey(key);
  const res = await pollJob(kind, remoteJobId, 45_000);
  const creative = extractCreative(res.data, res.text);
  const payload = { ...(creative as Record<string, unknown>), jobKind: kind, jobId: remoteJobId, tool: result.tool };

  if (!res.ok) {
    const errText = (res.text || 'Job status check failed').slice(0, 500);
    await db.contentJob.update({ where: { id: job.id }, data: { status: 'failed', error: errText, completedAt: new Date() } });
    const out = serialize('failed', job.provider, job.toolName, job.result, errText, job.creditsNote, job.createdAt, new Date());
    lastPoll.set(job.id, { at: now, payload: out });
    return NextResponse.json(out);
  }

  const done = Boolean((creative as Record<string, unknown>).pageUrl) || creative.mediaUrls.length > 0 || (creative.postCopy?.length ?? 0) > 0;
  const failed = /failed|error/i.test(res.text) && !done;
  if (done) {
    const updated = await db.contentJob.update({
      where: { id: job.id },
      data: { status: 'completed', result: payload as object, completedAt: new Date() },
    });
    const out = serialize(updated.status, updated.provider, updated.toolName, updated.result, null, updated.creditsNote, updated.createdAt, updated.completedAt);
    lastPoll.set(job.id, { at: now, payload: out });
    return NextResponse.json(out);
  }
  if (failed) {
    await db.contentJob.update({ where: { id: job.id }, data: { status: 'failed', error: res.text.slice(0, 500), completedAt: new Date() } });
    const out = serialize('failed', job.provider, job.toolName, job.result, res.text.slice(0, 500), job.creditsNote, job.createdAt, new Date());
    lastPoll.set(job.id, { at: now, payload: out });
    return NextResponse.json(out);
  }
  const out = serialize('running', job.provider, job.toolName, job.result, null, job.creditsNote, job.createdAt, null);
  lastPoll.set(job.id, { at: now, payload: out });
  return NextResponse.json(out);
}

function serialize(
  status: string,
  provider: string | null,
  toolName: string | null,
  result: unknown,
  error: string | null,
  creditsNote: string | null,
  createdAt: Date,
  completedAt: Date | null
) {
  return { id: undefined, status, provider, toolName, result, error, creditsNote, createdAt, completedAt };
}
