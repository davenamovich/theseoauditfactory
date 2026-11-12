'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, TriangleAlert, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface AuditStatus {
  id: string;
  shareId: string;
  host: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  stage: string;
  progress: number;
  error?: string | null;
}

const AGENT_STAGES = [
  'Agent 1 · Website Investigator',
  'Agent 2 · Technical SEO Auditor',
  'Agent 3 · Content Strategist',
  'Agent 4 · AI Search Specialist',
  'Agent 5 · Money-Saving Analyst',
  'Agent 7 · Report Writer',
];

export function AuditView({ id, navigate }: { id: string; navigate: (to: string) => void }) {
  const [status, setStatus] = useState<AuditStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/${id}`, { cache: 'no-store' });
        if (res.status === 404) {
          if (!cancelled) setError('Audit not found. It may have been removed.');
          return;
        }
        const data: AuditStatus = await res.json();
        if (cancelled) return;
        setStatus(data);
        if (data.status === 'completed') {
          setTimeout(() => navigate(`/report/${data.shareId || data.id}`), 700);
          return;
        }
        if (data.status === 'failed') return;
        timer = setTimeout(poll, 2000);
      } catch {
        if (!cancelled) timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, navigate]);

  const failed = status?.status === 'failed';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <Card className="border-primary/25 bg-card/80 card-sheen">
        <CardContent className="p-7 sm:p-9">
          {!failed ? (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <h1 className="text-xl font-black tracking-tight">Auditing {status?.host ?? 'your site'}...</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Real requests to your public pages. This usually takes under two minutes - slower sites take
                longer because we wait for actual responses.
              </p>
              <div className="mt-6">
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1.5">
                  <span>{status?.stage ?? 'Queued'}</span>
                  <span>{status?.progress ?? 0}%</span>
                </div>
                <Progress value={status?.progress ?? 4} className="h-2" />
              </div>
              <div className="mt-6 space-y-2">
                {AGENT_STAGES.map((stage, i) => {
                  const activeIdx = Math.min(5, Math.floor(((status?.progress ?? 0) / 100) * AGENT_STAGES.length));
                  const done = i < activeIdx || (status?.progress ?? 0) >= 100;
                  const active = i === activeIdx && (status?.progress ?? 0) < 100;
                  return (
                    <div key={stage} className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                      done ? 'border-primary/30 bg-primary/5 text-foreground' : active ? 'border-secondary/30 bg-secondary/5 text-foreground' : 'border-border/50 text-muted-foreground'
                    }`}>
                      {done ? <Check className="h-4 w-4 text-primary shrink-0" /> : active ? <Loader2 className="h-4 w-4 animate-spin text-secondary shrink-0" /> : <span className="h-4 w-4 rounded-full border border-border shrink-0" />}
                      {stage}
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Keep this tab open - we will jump to your report automatically.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <TriangleAlert className="h-5 w-5 text-red-400" />
                <h1 className="text-xl font-black tracking-tight">We could not audit this site</h1>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {status?.error || 'Something went wrong while crawling the site.'}
              </p>
              <div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-4 text-sm text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Common reasons:</p>
                <p>- The site blocks automated crawlers (403). Allowlist our bot (SeoAuditFactoryBot) and re-run.</p>
                <p>- The site was temporarily down or rate-limited us (429).</p>
                <p>- The URL could not be reached from our network.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  <RefreshCw className="h-4 w-4 mr-1.5" /> TRY ANOTHER SITE
                </Button>
                <Button variant="outline" onClick={() => navigate('/learn/how-to-audit-a-website')} className="border-border">
                  HOW TO AUDIT A WEBSITE <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-6">
        We crawl politely: descriptive user agent, timeouts, size caps, sampled links only.
      </p>
    </div>
  );
}
