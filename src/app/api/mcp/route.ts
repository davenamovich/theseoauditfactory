// The MCP surface: give a link, get the whole audit back in one call.
//
// This app was already an MCP *client* (it calls the Plunder & Riffle tools to
// make content). This is the other direction — anyone pointing an MCP client
// at <app>/api/mcp gets `audit_site`, and the answer carries the report, the
// prompts to hand to Muse, and the invitation, in one response.
//
// Stateless JSON-RPC over HTTP: no session, no SSE, nothing to keep alive. That
// is a deliberate limit — a member's client can retry a call without leaving a
// half-open stream behind, and we never hold state a crawl could outlive.
//
// The audit itself is the same one the web form runs. `startAudit` is shared,
// so the cache-first rule, the per-actor quota and the queue are one
// implementation, not two that drift.

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { startAudit, awaitAudit } from '@/lib/seo/start-audit';
import { buildMusePack } from '@/lib/seo/muse-prompts';
import { buildInvite } from '@/lib/seo/invite';
import type { AuditReport } from '@/lib/seo/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'seo-audit-factory', version: '1.0.0' };
const CRAWL_DEADLINE_MS = 90_000;

const INSTRUCTIONS = [
  'This server audits one website and returns measured results — nothing is estimated or invented.',
  'Call audit_site with a URL. It returns scores, findings with evidence, a list of prompts written for Muse (the member\'s assistant), and an invitation block.',
  'Show the member the scores and the top findings first. Offer the Muse prompts as copy-ready blocks.',
  'If a tool result says the crawl is still running, call get_audit with the returned id — do not start a second audit of the same site.',
].join(' ');

const TOOLS = [
  {
    name: 'audit_site',
    title: 'Audit a website',
    description:
      'Run a full SEO audit on one URL and return the report plus prompts for Muse. Covers technical checks, content, AI-search readiness, local SEO and measured page weight. Returns the cached report when the same site was audited recently.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The site to audit, e.g. https://example.com' },
        businessName: { type: 'string', description: 'Optional: what the business is called.' },
        industry: { type: 'string', description: 'Optional: sector, used for the local and content checks.' },
        location: { type: 'string', description: 'Optional: the area the business serves.' },
        force: {
          type: 'boolean',
          description: 'Ignore a recent cached report and crawl again. Spends one audit from the daily quota.',
        },
      },
      required: ['url'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_audit',
    title: 'Fetch an audit',
    description:
      'Fetch an audit that was started earlier by its id. Use this when audit_site said the crawl was still running.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'The id returned by audit_site.' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
];

type JsonRpcId = string | number | null;

const rpcOk = (id: JsonRpcId, result: unknown): NextResponse =>
  NextResponse.json({ jsonrpc: '2.0', id, result }, { headers: { 'Cache-Control': 'no-store' } });

const rpcErr = (id: JsonRpcId, code: number, message: string): NextResponse =>
  NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } }, { headers: { 'Cache-Control': 'no-store' } });

/** MCP expects tool output as content blocks, so JSON becomes one text block. */
const toolText = (value: unknown, isError = false): unknown => ({
  content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  ...(isError ? { isError: true } : {}),
});

/**
 * Who the daily quota belongs to. An MCP key if the client sends one, the IP
 * otherwise — never the raw value, only a hash of it.
 */
function actorHash(req: NextRequest): string {
  const auth = req.headers.get('authorization') ?? '';
  const key = (req.headers.get('x-mcp-api-key') ?? auth.replace(/^Bearer\s+/i, '')).trim();
  const fwd = req.headers.get('x-forwarded-for') ?? 'local';
  const ip = fwd.split(',')[0].trim();
  const basis = key ? `mcp-key:${key}` : `mcp-ip:${ip}`;
  return createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

type AuditRow = NonNullable<Awaited<ReturnType<typeof awaitAudit>>>;

/** Everything one call returns, in the shape a member's assistant should show. */
function auditPayload(row: AuditRow) {
  const report = (row.report ?? null) as unknown as AuditReport | null;
  return {
    id: row.id,
    shareId: row.shareId,
    status: row.status,
    url: row.url,
    finalUrl: row.finalUrl,
    host: row.host,
    businessName: row.businessName,
    scores: {
      overall: row.overallScore,
      technical: row.technicalScore,
      content: row.contentScore,
      ai: row.aiScore,
      local: row.localScore,
      performance: row.performanceScore,
    },
    report,
    muse: report ? buildMusePack(report) : null,
    invite: buildInvite(),
    notes: report?.notes ?? [],
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return rpcErr(null, -32700, 'Parse error: the body was not JSON.');
  }

  const id = (body.id ?? null) as JsonRpcId;
  const method = String(body.method ?? '');
  const params = (body.params ?? {}) as Record<string, unknown>;

  // Notifications carry no id and expect no body back.
  if (!method || method.startsWith('notifications/')) return new NextResponse(null, { status: 202 });

  if (method === 'initialize') {
    return rpcOk(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions: INSTRUCTIONS,
    });
  }
  if (method === 'ping') return rpcOk(id, {});
  if (method === 'tools/list') return rpcOk(id, { tools: TOOLS });

  if (method === 'tools/call') {
    const name = String(params.name ?? '');
    const args = (params.arguments ?? {}) as Record<string, unknown>;

    if (name === 'audit_site') {
      const started = await startAudit({
        url: String(args.url ?? ''),
        businessName: args.businessName as string | undefined,
        industry: args.industry as string | undefined,
        location: args.location as string | undefined,
        ipHash: actorHash(req),
        force: Boolean(args.force),
      });
      if (!started.ok) {
        return rpcOk(id, toolText({ error: started.error, quotaReached: started.quotaReached ?? false }, true));
      }
      const row = await awaitAudit(started.id, CRAWL_DEADLINE_MS);
      if (!row) return rpcOk(id, toolText({ error: 'The audit could not be found after starting.' }, true));
      if (row.status === 'completed') {
        return rpcOk(id, toolText({ ...auditPayload(row), cached: started.cached, note: started.note ?? null }));
      }
      return rpcOk(
        id,
        toolText({
          status: row.status,
          id: row.id,
          shareId: row.shareId,
          stage: row.stage,
          hint: 'The crawl is still running. Call get_audit with this id in about 30 seconds — do not start another audit of the same site.',
        })
      );
    }

    if (name === 'get_audit') {
      const row = await awaitAudit(String(args.id ?? ''), 5_000);
      if (!row) return rpcOk(id, toolText({ error: 'No audit with that id.' }, true));
      if (row.status !== 'completed') {
        return rpcOk(id, toolText({ status: row.status, id: row.id, stage: row.stage, progress: row.progress }));
      }
      return rpcOk(id, toolText(auditPayload(row)));
    }

    return rpcErr(id, -32602, `Unknown tool: ${name || '(none)'}`);
  }

  return rpcErr(id, -32601, `Method not found: ${method}`);
}

/** A browser hitting this path gets the handshake facts instead of a blank 405. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      server: SERVER_INFO,
      protocol: PROTOCOL_VERSION,
      transport: 'http-json-rpc',
      method: 'POST',
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
