// Server-side credential resolution for the P&R MCP integration.
// Keys are read from the environment first, then the database (set via admin).
// Keys are never sent to the browser: admin GET responses mask them.
import { db } from '@/lib/db';

const PNR_KEY_CONFIG = 'pnrApiKey';

export async function resolvePnrApiKey(): Promise<string | null> {
  if (process.env.PNR_MCP_KEY && process.env.PNR_MCP_KEY.trim()) return process.env.PNR_MCP_KEY.trim();
  try {
    const row = await db.appConfig.findUnique({ where: { key: PNR_KEY_CONFIG } });
    const value = row?.value as { v?: string } | null;
    if (value?.v && typeof value.v === 'string' && value.v.trim()) return value.v.trim();
  } catch {
    /* ignore */
  }
  return null;
}

export async function storePnrApiKey(key: string | null): Promise<void> {
  if (key && key.trim()) {
    await db.appConfig.upsert({
      where: { key: PNR_KEY_CONFIG },
      update: { value: { v: key.trim() } },
      create: { key: PNR_KEY_CONFIG, value: { v: key.trim() } },
    });
  } else {
    await db.appConfig.deleteMany({ where: { key: PNR_KEY_CONFIG } });
  }
}

export async function pnrKeyConfigured(): Promise<boolean> {
  return (await resolvePnrApiKey()) !== null;
}
