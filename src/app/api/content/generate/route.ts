import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/config';
import { resolvePnrApiKey } from '@/lib/credentials';
import { callTool, extractCreative, setMcpApiKey } from '@/lib/mcp/client';
import { ASSET_TYPES, planAssetCall, type AssetType, type BuildContext } from '@/lib/mcp/assets';
import { generateFallback } from '@/lib/mcp/fallback';
import type { AuditReport } from '@/lib/seo/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

function ipHash(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? 'local';
  return createHash('sha256').update(`saf:${fwd.split(',')[0].trim()}`).digest('hex').slice(0, 24);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const assetType = String(body.assetType ?? '') as AssetType;
  const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 300) : undefined;
  const auditId = typeof body.auditId === 'string' ? body.auditId : undefined;

  if (!ASSET_TYPES[assetType]) {
    return NextResponse.json({ error: 'Unknown content type.' }, { status: 400 });
  }

  const settings = await getSettings();

  // Resolve context: completed audit preferred; standalone website allowed.
  let ctx: BuildContext;
  let auditRow = null;
  if (auditId) {
    auditRow = await db.audit.findFirst({ where: { OR: [{ id: auditId }, { shareId: auditId }] } });
    if (!auditRow) return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });
    if (auditRow.status !== 'completed') {
      return NextResponse.json({ error: 'Finish the audit first, then generate content.' }, { status: 409 });
    }
    ctx = {
      website: auditRow.finalUrl || auditRow.url,
      businessName: auditRow.businessName ?? undefined,
      industry: auditRow.industry ?? undefined,
      location: auditRow.location ?? undefined,
      report: (auditRow.report as unknown as AuditReport) ?? null,
      topic,
    };
  } else {
    const website = String(body.website ?? '').trim();
    if (!website) return NextResponse.json({ error: 'Provide a website URL or run an audit first.' }, { status: 400 });
    ctx = {
      website,
      businessName: typeof body.businessName === 'string' ? body.businessName.trim() : undefined,
      industry: typeof body.industry === 'string' ? body.industry.trim() : undefined,
      location: typeof body.location === 'string' ? body.location.trim() : undefined,
      topic,
    };
  }

  // Free sample allowance (configurable in the admin dashboard).
  if (auditRow) {
    const used = await db.contentJob.count({ where: { auditId: auditRow.id, status: { not: 'failed' } } });
    if (used >= settings.freeContentPerAudit) {
      return NextResponse.json(
        {
          error: `Free sample allowance reached (${settings.freeContentPerAudit} per audit, set by the operator). Head to Plunder & Riffle for unlimited content creation.`,
          allowanceReached: true,
          exploreUrl: 'https://www.plunderandriffle.com/whop',
        },
        { status: 402 }
      );
    }
  } else {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const ip = ipHash(req);
    const recent = await db.contentJob.count({
      where: { createdAt: { gte: since }, status: { not: 'failed' }, prompt: { path: '$.ipHash', equals: ip } as never },
    }).catch(() => 0);
    if (recent >= settings.freeContentPerAudit * 2) {
      return NextResponse.json({ error: 'Daily free generation limit reached.' }, { status: 429 });
    }
  }

  const key = await resolvePnrApiKey();
  setMcpApiKey(key);

  const job = await db.contentJob.create({
    data: {
      auditId: auditRow?.id ?? null,
      assetType,
      topic: topic ?? null,
      status: 'running',
      provider: key ? 'pnr-mcp' : settings.mcpFallbackEnabled ? 'built-in-fallback' : null,
      prompt: { ipHash: ipHash(req), plannedTool: ASSET_TYPES[assetType].tool } as object,
    },
  });

  try {
    // No key configured: use the clearly-labeled built-in fallback if enabled.
    if (!key) {
      if (!settings.mcpFallbackEnabled) {
        await db.contentJob.update({
          where: { id: job.id },
          data: { status: 'failed', error: 'P&R MCP API key is not configured and fallback generation is disabled.' },
        });
        return NextResponse.json(
          { jobId: job.id, status: 'failed', error: 'P&R MCP API key is not configured. Operators can set it in the admin dashboard.' },
          { status: 503 }
        );
      }
      const result = await generateFallback(assetType, ctx);
      const updated = await db.contentJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          provider: 'built-in-fallback',
          toolName: 'built-in-ai-engine',
          creditsNote: 'Generated with the built-in AI engine because no P&R MCP API key is configured.',
          result: result as unknown as object,
          completedAt: new Date(),
        },
      });
      return NextResponse.json({
        jobId: updated.id,
        status: updated.status,
        provider: updated.provider,
        note: 'Generated with the built-in AI engine. Connect a P&R MCP API key in admin settings to route generation through Plunder & Riffle.',
      });
    }

    // Real P&R MCP path.
    if (assetType === 'repurpose-pack') {
      const research = await callTool('research_brand', { url: ctx.website }, 60_000);
      if (research.ok && research.data && typeof research.data === 'object') {
        const bp = (research.data as Record<string, unknown>).brandProfile;
        if (bp && typeof bp === 'object') {
          const planned = planAssetCall('social-graphic', ctx);
          const res = await callTool('generate_ad_creative', { ...planned.args, brandProfile: bp }, 150_000);
          return finish(res, 'generate_ad_creative');
        }
      }
      // research failed or no brandProfile: continue with a plain creative call
      const planned = planAssetCall('social-graphic', ctx);
      const res = await callTool('generate_ad_creative', planned.args, 150_000);
      return finish(res, 'generate_ad_creative');
    }

    const planned = planAssetCall(assetType, ctx);
    if (planned.async) {
      const res = await callTool(planned.tool, planned.args, 150_000);
      const creative = extractCreative(res.data, res.text);
      if (!res.ok) {
        await db.contentJob.update({
          where: { id: job.id },
          data: { status: 'failed', toolName: planned.tool, error: res.text.slice(0, 500) || 'MCP call failed', completedAt: new Date() },
        });
        return NextResponse.json({ jobId: job.id, status: 'failed', error: res.text.slice(0, 500) }, { status: 502 });
      }
      const jobId = creative.jobId;
      const kind = planned.jobKind ?? creative.jobKind;
      if (jobId && kind) {
        await db.contentJob.update({
          where: { id: job.id },
          data: {
            status: 'running',
            toolName: planned.tool,
            creditsNote: ASSET_TYPES[assetType].creditsNote,
            result: { jobKind: kind, jobId, tool: planned.tool } as object,
          },
        });
        return NextResponse.json({ jobId: job.id, status: 'running', provider: 'pnr-mcp', tool: planned.tool });
      }
      // Synchronous-looking result without a job id: extract directly.
      return finish(res, planned.tool);
    }

    const res = await callTool(planned.tool, planned.args, 150_000);
    return finish(res, planned.tool);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    await db.contentJob
      .update({ where: { id: job.id }, data: { status: 'failed', error: message.slice(0, 500), completedAt: new Date() } })
      .catch(() => undefined);
    return NextResponse.json({ jobId: job.id, status: 'failed', error: message }, { status: 500 });
  }

  async function finish(res: Awaited<ReturnType<typeof callTool>>, toolName: string) {
    const creative = extractCreative(res.data, res.text);
    if (!res.ok) {
      await db.contentJob.update({
        where: { id: job.id },
        data: { status: 'failed', toolName, error: res.text.slice(0, 500) || 'MCP call failed', completedAt: new Date() },
      });
      return NextResponse.json({ jobId: job.id, status: 'failed', error: res.text.slice(0, 500) }, { status: 502 });
    }
    const updated = await db.contentJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        provider: 'pnr-mcp',
        toolName,
        creditsNote: ASSET_TYPES[assetType].creditsNote,
        result: creative as unknown as object,
        completedAt: new Date(),
      },
    });
    return NextResponse.json({ jobId: updated.id, status: 'completed', provider: 'pnr-mcp', tool: toolName });
  }
}
