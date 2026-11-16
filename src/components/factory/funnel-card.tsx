'use client';

// Audit -> funnel, through the live P&R MCP create_funnel tool (format bestof).
// The audit's measured findings become the funnel's context, angle and
// objection; P&R reads the site itself, builds a day of content whose CTA is
// the site, and publishes one share page bundling it (dayPack.shareUrl).

import { useCallback, useEffect, useState } from 'react';
import { Filter, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { JobCard, type Job } from './views/studio-view';
import type { AuditReport } from '@/lib/seo/types';

const ASSET = 'audit-funnel';
const STEPS = [
  'Reading your website via the P&R funnel engine',
  'Turning your audit findings into angles',
  'Writing 2 memes, an iMessage, a slideshow and a ranked list',
  'Publishing your day-pack share page',
];

export function FunnelCard({ auditId, report }: { auditId: string; report: AuditReport }) {
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/content/jobs?auditId=${encodeURIComponent(auditId)}`, { cache: 'no-store' });
      const data = await res.json();
      const mine: Job[] = (data.jobs ?? []).filter((j: Job) => j.assetType === ASSET);
      setJob(mine.find((j) => j.status !== 'failed') ?? mine[0] ?? null);
    } catch {
      /* keep current state */
    }
  }, [auditId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while running; the server throttles calls to P&R's pollAfterSec.
  useEffect(() => {
    if (job?.status !== 'running') return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/content/jobs/${job.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.status !== 'running') {
          clearInterval(poll);
          load();
        }
      } catch {
        /* keep polling */
      }
    }, 6000);
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 25_000);
    return () => {
      clearInterval(poll);
      clearInterval(ticker);
    };
  }, [job?.id, job?.status, load]);

  const build = async () => {
    setBusy(true);
    setStep(0);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, assetType: ASSET }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: data.allowanceReached ? 'Free samples used up' : 'Funnel failed',
          description: data.error ?? 'Something went wrong.',
        });
      }
      await load();
    } catch {
      toast({ title: 'Network error', description: 'Could not reach the funnel generator.' });
    } finally {
      setBusy(false);
    }
  };

  const objection = report.topProblems?.[0]?.title;
  const angle = report.contentIdeas?.[0];
  const running = busy || job?.status === 'running';

  return (
    <section className="mt-8 rounded-xl border border-primary/25 bg-card/80 p-5 sm:p-6 print-card">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-black tracking-tight">TURN THIS REPORT INTO A FUNNEL</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        The live Plunder &amp; Riffle MCP reads your site and builds a full day of content from this audit: 2 memes, an
        iMessage thread, a slideshow and a ranked list. It publishes them on one share page, and every piece sends people to{' '}
        <span className="font-mono text-foreground/80">{report.host}</span>.
      </p>
      {(objection || angle) && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {angle && (
            <li><span className="text-primary font-bold">Angle:</span> {angle}</li>
          )}
          {objection && (
            <li><span className="text-primary font-bold">Objection it answers (from your audit):</span> {objection}</li>
          )}
        </ul>
      )}

      {running && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2.5 print-hidden">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <span>{STEPS[step]}... <span className="text-muted-foreground">(usually 1-4 minutes)</span></span>
        </div>
      )}

      {job && job.status !== 'running' && (
        <div className="mt-4">
          <JobCard job={job} onRefresh={load} />
        </div>
      )}

      {!running && (!job || job.status === 'failed') && (
        <Button onClick={build} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold w-full print-hidden">
          <Sparkles className="h-4 w-4 mr-1.5" /> {job?.status === 'failed' ? 'TRY THE FUNNEL AGAIN' : 'BUILD MY FUNNEL FROM THIS REPORT'}
        </Button>
      )}
    </section>
  );
}
