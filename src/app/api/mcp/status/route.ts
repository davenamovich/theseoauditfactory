import { NextResponse } from 'next/server';
import { getMcpStatus } from '@/lib/mcp/client';
import { pnrKeyConfigured } from '@/lib/credentials';

export const runtime = 'nodejs';

// Live MCP connection inspection: initialize + tools/list against the real endpoint.
export async function GET() {
  const [status, keyConfigured] = await Promise.all([getMcpStatus(true), pnrKeyConfigured()]);
  return NextResponse.json({
    endpoint: process.env.PNR_MCP_URL || 'https://bot.plunderandriffle.com/api/mcp',
    reachable: status.reachable,
    serverInfo: status.serverInfo ?? null,
    toolCount: status.tools.length,
    tools: status.tools.map((t) => ({ name: t.name, title: t.title, description: t.description?.slice(0, 220) })),
    error: status.error ?? null,
    keyConfigured,
    generationReady: status.reachable && keyConfigured,
    checkedAt: status.checkedAt,
  });
}
