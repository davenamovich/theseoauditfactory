// Application configuration, persisted in AppConfig table with in-memory cache.
import { db } from '@/lib/db';

export interface AppSettings {
  freeContentPerAudit: number;
  freeBeforePerAudit: number;
  maxAuditsPerIpPerDay: number;
  auditConcurrency: number;
  cacheTtlMinutes: number;
  mcpFallbackEnabled: boolean;
}

const DEFAULTS: AppSettings = {
  freeContentPerAudit: 3,
  freeBeforePerAudit: 1,
  maxAuditsPerIpPerDay: 50,
  auditConcurrency: 2,
  cacheTtlMinutes: 720,
  mcpFallbackEnabled: true,
};

let cache: { value: AppSettings; at: number } | null = null;

export async function getSettings(): Promise<AppSettings> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  const merged: AppSettings = { ...DEFAULTS };
  try {
    const rows = await db.appConfig.findMany();
    for (const row of rows) {
      if (row.key in merged) {
        const typedKey = row.key as keyof AppSettings;
        const value = row.value as { v: unknown };
        if (value && typeof value === 'object' && 'v' in value) {
          const current = merged[typedKey];
          if (typeof current === 'boolean') (merged[typedKey] as boolean) = Boolean(value.v);
          else if (typeof current === 'number') (merged[typedKey] as number) = Number(value.v) || DEFAULTS[typedKey];
        }
      }
    }
  } catch {
    /* fall back to defaults */
  }
  cache = { value: merged, at: Date.now() };
  return merged;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  for (const [key, value] of Object.entries(patch)) {
    if (key in DEFAULTS && value !== undefined) {
      await db.appConfig.upsert({
        where: { key },
        update: { value: { v: value } as object },
        create: { key, value: { v: value } as object },
      });
    }
  }
  cache = null;
  return getSettings();
}
