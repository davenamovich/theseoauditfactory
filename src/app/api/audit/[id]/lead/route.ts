import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Optional email delivery / audit-history opt-in. Consent is explicit.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const consent = Boolean(body.consent);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: 'We need your consent before storing your email.' }, { status: 400 });
  }
  const audit = await db.audit.findUnique({ where: { id } });
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  await db.audit.update({ where: { id }, data: { email: email.slice(0, 200), consent: true } });
  return NextResponse.json({
    ok: true,
    note: 'Saved. Email delivery requires SMTP configuration on the deployment; your report link stays available here.',
  });
}
