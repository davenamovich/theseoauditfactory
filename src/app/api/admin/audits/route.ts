import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function adminKeyValid(req: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY || 'plunder-admin';
  return (req.headers.get('x-admin-key') ?? '') === expected;
}

// Lightweight auth check used by the admin UI login gate.
export async function GET(req: NextRequest) {
  if (!adminKeyValid(req)) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
