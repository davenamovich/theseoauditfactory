import { NextRequest, NextResponse } from 'next/server';
import { adminKeyConfigured, adminKeyValid } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Lightweight auth check used by the admin UI login gate.
export async function GET(req: NextRequest) {
  if (!adminKeyValid(req)) return NextResponse.json({ ok: false, configured: adminKeyConfigured() }, { status: 401 });
  return NextResponse.json({ ok: true });
}
