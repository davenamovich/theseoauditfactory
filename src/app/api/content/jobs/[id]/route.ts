import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callTool, pollJob, extractCreative, setMcpApiKey } from '@/lib/mcp/client';
import { resolvePnrApiKey } from '@/lib/credentials';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RUN_TIMEOUT_MS = 8 * 60 * 1000;

// Poll a content job. For async P&R jobs, this lazily polls get_job_status
// against the live MCP server (the MCP guidance is to poll every 20-30s;
// we cache the poll result server-side so browser refreshes do not spam it).
const lastPoll = new Map<string, { at: number; payload: unknown; ttl?: number }>();

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
  if (cached && now - cached.at < (cached.ttl ?? 12_000)) {
    return NextResponse.json(cached.payload);
  }

  const key = await resolvePnrApiKey();
  setMcpApiKey(key);
  const res = await pollJob(kind, remoteJobId, 45_000);
  const creative = extractCreative(res.data, res.text);
  // Keep request-time facts (offer link, funnel description) on the stored result.
  const payload = {
    ...result,
    ...(creative as unknown as Record<string, unknown>),
    offerUrl: creative.offerUrl ?? result.offerUrl,
    jobKind: kind,
    jobId: remoteJobId,
    tool: result.tool,
  };
  // Honour the server's pollAfterSec (12-30s) so browser polling never spams P&R.
  const ttl = Math.min(30_000, Math.max(12_000, (creative.pollAfterSec ?? 12) * 1000));

  const fail = async (errText: string) => {
    await db.contentJob.update({ where: { id: job.id }, data: { status: 'failed', error: errText.slice(0, 500), completedAt: new Date() } });
    const out = serialize('failed', job.provider, job.toolName, job.result, errText.slice(0, 500), job.creditsNote, job.createdAt, new Date());
    lastPoll.set(job.id, { at: now, payload: out });
    return NextResponse.json(out);
  };
  const stillRunning = (resultForRow: unknown = job.result) => {
    const out = serialize('running', job.provider, job.toolName, resultForRow, null, job.creditsNote, job.createdAt, null);
    lastPoll.set(job.id, { at: now, payload: out, ttl });
    return NextResponse.json(out);
  };

  if (!res.ok) return fail(res.text || 'Job status check failed');

  const phase = creative.phase;
  const hasOutput =
    Boolean(creative.pageUrl || creative.shareUrl || creative.mp4PageUrl) ||
    creative.mediaUrls.length > 0 ||
    (creative.postCopy?.length ?? 0) > 0;

  // needs_input: a funnel whose page could not be read pauses for a
  // description. Answer it once from the audit, then keep polling.
  if (phase === 'needs_input') {
    const desc = typeof result.funnelDescription === 'string' ? result.funnelDescription : '';
    if (kind === 'funnel' && desc && !result.describedAt) {
      const retry = await callTool('create_funnel', { funnel_id: remoteJobId, description: desc }, 60_000);
      if (!retry.ok) return fail(`P&R funnel needed a description and the retry failed: ${retry.text}`);
      const updatedResult = { ...result, describedAt: new Date().toISOString() };
      await db.contentJob.update({ where: { id: job.id }, data: { result: updatedResult as object } });
      return stillRunning(updatedResult);
    }
    return fail(`P&R needs more input to continue (${creative.status ?? 'needs_input'}). ${res.text.slice(0, 300)}`);
  }

  // Prefer the explicit lifecycle; fall back to output sniffing for older servers.
  const done = phase ? phase === 'done' : hasOutput;
  const failed = phase ? phase === 'failed' : /"?(status|phase)"?\s*[:=]\s*"?(failed|error)/i.test(res.text) && !hasOutput;

  if (done) {
    const updated = await db.contentJob.update({
      where: { id: job.id },
      data: { status: 'completed', result: payload as object, completedAt: new Date() },
    });
    const out = serialize(updated.status, updated.provider, updated.toolName, updated.result, null, updated.creditsNote, updated.createdAt, updated.completedAt);
    lastPoll.set(job.id, { at: now, payload: out });
    return NextResponse.json(out);
  }
  if (failed) return fail(`${res.text.slice(0, 400)} (P&R refunds failed jobs.)`);
  return stillRunning();
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
