'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, ArrowDownRight, ArrowUpRight, BadgeCheck, BookOpen, Bot, Calculator, Check, ChevronRight,
  Clock, Copy, Download, ExternalLink, Flame, Gauge, Lightbulb, Loader2, Mail, MapPin,
  Minus, PiggyBank, Printer, RefreshCw, Share2, ShieldAlert, Wrench, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScoreRing, scoreColor } from '../score-ring';
import { PnRBanner } from '../pnr-banner';
import { ContentStudio } from './studio-view';
import type { AuditReport, Finding, SavingsOpportunity, Severity } from '@/lib/seo/types';
import type { Route } from '../router';

const SEVERITY_STYLE: Record<Severity, { badge: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { badge: 'bg-red-500/15 text-red-400 border-red-500/30', icon: ShieldAlert, label: 'Critical' },
  high: { badge: 'bg-red-500/10 text-red-400 border-red-500/25', icon: AlertTriangle, label: 'High' },
  medium: { badge: 'bg-amber-500/12 text-amber-400 border-amber-500/30', icon: AlertTriangle, label: 'Medium' },
  low: { badge: 'bg-zinc-500/12 text-zinc-300 border-zinc-500/30', icon: AlertTriangle, label: 'Low' },
};

function money(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function ReportView({ id, navigate }: { id: string; navigate: (to: string) => void }) {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [meta, setMeta] = useState<{ host: string; businessName?: string | null; shareId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ host?: string; reason: string } | null>(null);
  const [rerunning, setRerunning] = useState(false);
  const { toast } = useToast();

  const rerun = async () => {
    if (rerunning) return;
    setRerunning(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: report?.url ?? meta?.host, force: true, businessName: meta?.businessName ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Could not re-run the audit', description: data.error ?? 'Please try again.' });
        return;
      }
      navigate(`/audit/${data.id}`);
    } catch {
      toast({ title: 'Network error', description: 'Could not re-run the audit. Try again.' });
    } finally {
      setRerunning(false);
    }
  };

  useEffect(() => {
    fetch(`/api/audit/${id}`, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) throw new Error('Report not found');
        const data = await r.json();
        if (data.status === 'failed') {
          // Surface the honest failure reason instead of a generic message.
          setFailure({ host: data.host, reason: data.error || 'The audit could not be completed.' });
          return;
        }
        if (data.status !== 'completed' || !data.report) {
          // Still running: send the visitor to the live progress view.
          navigate(`/audit/${data.id}`);
          return;
        }
        setReport(data.report as AuditReport);
        setMeta({ host: data.host, businessName: data.businessName, shareId: data.shareId });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const shareLink = useMemo(() => (typeof window !== 'undefined' && meta ? `${window.location.origin}/#/report/${meta.shareId}` : ''), [meta]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Loading your report...
      </div>
    );
  }
  if (error || !report || !meta) {
    if (failure) {
      const botBlocked = /refused our audit bot|403|rate-limited|429/i.test(failure.reason);
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-secondary mx-auto" />
          <h1 className="mt-4 text-2xl font-black tracking-tight">
            WE COULD NOT AUDIT {failure.host ? failure.host.toUpperCase() : 'THIS SITE'}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{failure.reason}</p>
          {botBlocked && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              We do not fabricate scores when a site blocks us. If you own this site, allowlist our user
              agent (SeoAuditFactoryBot) in your firewall or CDN bot rules, then run the audit again.
            </p>
          )}
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black" onClick={() => navigate('/')}>
              TRY ANOTHER SITE
            </Button>
            <Button variant="outline" className="border-border/60" onClick={() => navigate('/learn/how-to-audit-a-website')}>
              WHY SITES BLOCK AUDITS
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="h-8 w-8 text-secondary mx-auto" />
        <h1 className="mt-4 text-xl font-black">{error ?? 'Report unavailable'}</h1>
        <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/')}>
          RUN A NEW AUDIT
        </Button>
      </div>
    );
  }

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: 'Share link copied', description: 'Anyone with the link can view this report.' });
    } catch {
      toast({ title: 'Copy failed', description: shareLink });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Free SEO audit report</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
            {meta.businessName || meta.host}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            {report.finalUrl} · {new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print-hidden">
          <Button variant="outline" size="sm" onClick={copyShare} className="border-border"><Share2 className="h-4 w-4 mr-1.5" /> SHARE</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="border-border"><Printer className="h-4 w-4 mr-1.5" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={rerun} disabled={rerunning} className="border-primary/40 text-primary hover:bg-primary/10">
            {rerunning ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />} RE-RUN
          </Button>
        </div>
      </div>

      {/* Limited audit banner (site blocked our crawler - honest partial report) */}
      {report.mode === 'limited' && (
        <Card className="mt-6 border-amber-500/40 bg-amber-500/5 print-card">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-black tracking-tight">LIMITED AUDIT - THE SITE BLOCKED OUR CRAWLER</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {report.limitedReason} We never fake results, so everything below covers only what was still
                  verifiable: robots.txt, sitemap, response headers and redirects. Categories marked
                  <span className="font-mono font-bold text-foreground"> N/A </span>
                  could not be measured.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Fix the block (allowlist our crawler, user-agent <span className="font-mono">SeoAuditFactoryBot</span>,
                  or exempt known AI crawlers in your CDN) and re-run - the full report unlocks automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scores */}
      <Card className="mt-7 border-primary/25 bg-card/80 card-sheen print-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center shrink-0">
              <ScoreRing value={report.scores.overall} size={150} stroke={12} animated label="Overall" />
              <div className="mt-2 text-sm font-bold">Grade {report.grade}</div>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {([
                { label: 'Technical', key: 'technical', score: report.scores.technical },
                { label: 'Content', key: 'content', score: report.scores.content },
                { label: 'AI Search', key: 'ai', score: report.scores.ai },
                { label: 'Local', key: 'local', score: report.scores.local },
                { label: 'Performance', key: 'performance', score: report.scores.performance },
              ] as Array<{ label: string; key: string; score: number }>).map(({ label, key, score }) => (
                <div key={key} className="text-center rounded-xl border border-border/60 bg-background/40 py-4">
                  {report.unmeasured?.includes(key as never) ? (
                    <>
                      <div className="h-[74px] flex items-center justify-center">
                        <span className="font-mono text-xl font-black text-muted-foreground" aria-label="Not measured">N/A</span>
                      </div>
                      <div className="mt-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
                    </>
                  ) : (
                    <>
                      <ScoreRing value={score} size={74} stroke={7} animated />
                      <div className="mt-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-5" />
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
            <span>Crawled: {report.finalUrl}</span>
            {report.sitemap.found && report.sitemap.urlCount ? <span>Sitemap: {report.sitemap.urlCount} URLs</span> : <span>Sitemap: not found</span>}
            {report.performance.ttfbMs !== null && <span>TTFB: {report.performance.ttfbMs}ms</span>}
            <span>Pages sampled: {report.pages.length}</span>
            <span>Links tested: sample</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress vs previous audit (only when a prior completed audit exists) */}
      {report.comparison && (
        <Card className="mt-5 border-border/70 bg-card/60 print-card">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {report.comparison.deltas.overall >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-400" />
                )}
                <div>
                  <div className="font-black tracking-tight">PROGRESS SINCE YOUR LAST AUDIT</div>
                  <div className="text-xs text-muted-foreground">
                    Compared with the completed audit from {new Date(report.comparison.previousRunAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}. Both runs are real crawls.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">was {report.comparison.previousOverall}</span>
                <span className="font-mono text-lg font-black text-primary">{report.scores.overall}</span>
                <Badge variant="outline" className={report.comparison.deltas.overall >= 0 ? 'border-primary/40 text-primary' : 'border-red-500/40 text-red-400'}>
                  {report.comparison.deltas.overall >= 0 ? '+' : ''}{report.comparison.deltas.overall} overall
                </Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {([
                ['Technical', report.comparison.deltas.technical],
                ['Content', report.comparison.deltas.content],
                ['AI Search', report.comparison.deltas.ai],
                ['Local', report.comparison.deltas.local],
                ['Performance', report.comparison.deltas.performance],
              ] as Array<[string, number]>).map(([label, d]) => (
                <div key={label} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                  <span className={`font-mono text-sm font-bold ${d > 0 ? 'text-primary' : d < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {d > 0 ? '+' : ''}{d}
                  </span>
                </div>
              ))}
            </div>
            {(report.comparison.fixedFindings.length > 0 || report.comparison.newFindings.length > 0) && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
                {report.comparison.fixedFindings.length > 0 && (
                  <div className="rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-3">
                    <div className="font-bold text-primary flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" /> RESOLVED SINCE LAST RUN</div>
                    <ul className="mt-1.5 space-y-1 text-muted-foreground">
                      {report.comparison.fixedFindings.slice(0, 5).map((code) => <li key={code} className="font-mono">{code}</li>)}
                    </ul>
                  </div>
                )}
                {report.comparison.newFindings.length > 0 && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-3">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> NEW THIS RUN</div>
                    <ul className="mt-1.5 space-y-1 text-muted-foreground">
                      {report.comparison.newFindings.slice(0, 5).map((code) => <li key={code} className="font-mono">{code}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Savings estimate band */}
      {report.savings.length === 5 && (
        <div className="mt-5 rounded-2xl border border-secondary/30 bg-secondary/5 p-5 sm:p-6 print-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <PiggyBank className="h-5 w-5 text-secondary" />
              <div>
                <div className="font-black tracking-tight">FIVE WAYS YOU ARE LOSING MONEY</div>
                <div className="text-xs text-muted-foreground">Illustrative potential savings: {money(report.savings.reduce((n, s) => n + s.savingsMin, 0))} - {money(report.savings.reduce((n, s) => n + s.savingsMax, 0))} per year. Estimates, not quotes - edit the assumptions below.</div>
              </div>
            </div>
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold print-hidden" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
              <Calculator className="h-4 w-4 mr-1.5" /> OPEN CALCULATOR
            </Button>
          </div>
        </div>
      )}

      {/* Top problems */}
      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" /> TOP PROBLEMS WE FOUND
        </h2>
        <div className="mt-4 space-y-3">
          {report.topProblems.map((f, i) => (
            <FindingCard key={f.code + i} finding={f} defaultOpen={i === 0} />
          ))}
          {report.topProblems.length === 0 && (
            <p className="text-sm text-muted-foreground">No significant problems found in the sampled checks. Nice.</p>
          )}
        </div>
      </section>

      {/* Five savings */}
      <section className="mt-12">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-secondary" /> THE FIVE WAYS YOU ARE LOSING MONEY
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Problems translated into business economics. Every number is an illustrative scenario with stated assumptions - we cannot see your invoices and we never pretend otherwise.</p>
        {report.savings.length > 0 ? (
          <div className="mt-4 space-y-3">
            {report.savings.map((s) => (
              <SavingsCard key={s.id} savings={s} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Savings scenarios need page content to analyze - they unlock once the site lets our crawler read the page (see the limited-audit banner above).</p>
        )}
      </section>

      {/* Calculator */}
      <SavingsCalculator />

      {/* Quick wins + AI readiness */}
      <div className="mt-12 grid lg:grid-cols-2 gap-5">
        <Card className="border-border/70 bg-card/70 print-card">
          <CardContent className="p-6">
            <h2 className="font-black tracking-tight flex items-center gap-2"><Lightbulb className="h-5 w-5 text-secondary" /> QUICK WINS</h2>
            <div className="mt-4 space-y-2.5">
              {report.quickWins.map((f, i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-3.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">{f.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.action}</p>
                </div>
              ))}
              {report.quickWins.length === 0 && <p className="text-sm text-muted-foreground">No quick wins left - your site is well maintained.</p>}
            </div>
          </CardContent>
        </Card>
        <AiReadinessCard report={report} navigate={navigate} />
      </div>

      {/* Category breakdown */}
      <section className="mt-12">
        <h2 className="text-xl font-black tracking-tight">SCORE BREAKDOWN - EVERY CHECK</h2>
        <Accordion type="multiple" className="mt-4">
          {report.categories.map((cat) => (
            <AccordionItem key={cat.key} value={cat.key} className="border-border/60">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className={`font-mono font-black text-lg ${scoreColor(cat.score)}`}>{cat.score}</span>
                  <span className="font-semibold">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">{cat.checks.filter((c) => c.status !== 'na').length} checks · {cat.checks.filter((c) => c.status === 'na').length} not measurable</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid sm:grid-cols-2 gap-2 pb-2">
                  {cat.checks.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/30 px-3.5 py-2.5">
                      {c.status === 'pass' ? <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> : c.status === 'warn' ? <Minus className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> : c.status === 'fail' ? <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" /> : <span className="h-4 w-4 rounded-full border border-border shrink-0 mt-0.5 text-[9px] flex items-center justify-center text-muted-foreground">n/a</span>}
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{c.label}</div>
                        {c.detail && <div className="text-xs text-muted-foreground break-words">{c.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Action plan */}
      <section className="mt-12">
        <h2 className="text-xl font-black tracking-tight">YOUR ACTION PLAN</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {[
            { t: 'TODAY', d: 'Fix the easy problems.', items: report.actionPlan.today, icon: Flame, color: 'border-red-500/30 bg-red-500/5' },
            { t: 'THIS WEEK', d: 'Improve your website and content.', items: report.actionPlan.week, icon: Clock, color: 'border-amber-500/30 bg-amber-500/5' },
            { t: 'THIS MONTH', d: 'Build authority and visibility.', items: report.actionPlan.month, icon: BadgeCheck, color: 'border-primary/30 bg-primary/5' },
          ].map((col) => (
            <div key={col.t} className={`rounded-xl border p-5 ${col.color} print-card`}>
              <div className="flex items-center gap-2">
                <col.icon className="h-4.5 w-4.5 h-5 w-5" />
                <div>
                  <div className="font-black tracking-wide text-sm">{col.t}</div>
                  <div className="text-[11px] text-muted-foreground">{col.d}</div>
                </div>
              </div>
              <ul className="mt-3.5 space-y-2">
                {col.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed"><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" /><span>{item}</span></li>
                ))}
                {col.items.length === 0 && <li className="text-sm text-muted-foreground">Nothing required here.</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Content ideas + studio */}
      <section className="mt-12 rounded-2xl border border-primary/25 bg-card/70 p-6 sm:p-8 print-card">
        <h2 className="text-xl font-black tracking-tight text-center sm:text-left">
          YOUR WEBSITE HAS CONTENT. <span className="text-primary">LET&apos;S TURN IT INTO ATTENTION.</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Ideas built from your actual pages, generated through the live Plunder &amp; Riffle MCP:</p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {report.contentIdeas.map((idea, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground bg-background/40 border border-border/50 rounded-lg px-3.5 py-2.5">
              <span className="text-primary shrink-0">»</span>{idea}
            </li>
          ))}
        </ul>
        {report.contentIdeas.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Ideas are built from your actual pages - they appear once the site lets our crawler read the content.</p>
        )}
        <div className="mt-6 print-hidden">
          <ContentStudio auditId={meta.shareId} compact />
        </div>
      </section>

      {/* Pages sampled */}
      <section className="mt-12">
        <h2 className="text-xl font-black tracking-tight">PAGES WE SAMPLED</h2>
        <div className="mt-4 rounded-xl border border-border/60 overflow-hidden">
          <div className="max-h-80 overflow-y-auto scroll-slim">
            <table className="w-full text-sm">
              <thead className="bg-card/80 sticky top-0">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">Page</th>
                  <th className="px-4 py-2.5 font-semibold">Title</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Words</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.pages.map((p) => (
                  <tr key={p.url} className="border-t border-border/40 bg-background/30">
                    <td className="px-4 py-2.5 font-mono text-xs max-w-[220px] truncate">{p.url.replace(/^https?:\/\//, '')}</td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[260px] truncate">{p.title || '(no title)'}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{p.words}</td>
                    <td className={`px-4 py-2.5 text-right font-mono ${p.ok ? 'text-primary' : 'text-red-400'}`}>{p.status ?? 'err'}</td>
                  </tr>
                ))}
                {report.pages.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-4 text-muted-foreground text-center">No internal pages could be sampled.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <LeadCapture auditId={meta.shareId} />

      {/* Notes */}
      <section className="mt-10 rounded-xl border border-border/60 bg-background/30 p-5">
        <h3 className="text-sm font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /> HOW TO READ THIS REPORT (HONEST LIMITS)</h3>
        <ul className="mt-2.5 space-y-1.5">
          {report.notes.map((n, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed">- {n}</li>
          ))}
        </ul>
      </section>

      <div className="mt-10 print-hidden">
        <PnRBanner />
      </div>
    </div>
  );
}

function FindingCard({ finding, defaultOpen = false }: { finding: Finding; defaultOpen?: boolean }) {
  const style = SEVERITY_STYLE[finding.severity] ?? SEVERITY_STYLE.low;
  const evidence = Array.isArray(finding.evidence) ? finding.evidence : [String(finding.evidence ?? '')];
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? 'open' : undefined}>
      <AccordionItem value="open" className="border-border/60 rounded-xl border bg-card/60 px-4 print-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="flex items-center gap-3 text-left">
            <style.icon className={`h-4.5 w-4.5 h-5 w-5 shrink-0 ${finding.severity === 'critical' || finding.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
            <span className="flex-1">
              <span className="font-semibold text-sm sm:text-base">{finding.title}</span>
            </span>
            <Badge variant="outline" className={`${style.badge} shrink-0 font-bold`}>{style.label}</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Evidence</div>
              <ul className="mt-1.5 space-y-1">
                {evidence.map((e, i) => (
                  <li key={i} className="text-xs font-mono bg-background/60 border border-border/50 rounded px-2.5 py-1.5 break-words">{e}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Why it matters</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{finding.explanation}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Do this</div>
                <p className="mt-1 text-sm leading-relaxed">{finding.action}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <Badge variant="outline" className="border-border">Impact: {finding.impact}</Badge>
                <Badge variant="outline" className="border-border">Effort: {finding.effort === 'quick' ? 'Quick fix' : finding.effort === 'medium' ? 'Medium' : 'Project'}</Badge>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SavingsCard({ savings }: { savings: SavingsOpportunity }) {
  const confColor = savings.confidence === 'High' ? 'text-primary border-primary/40' : savings.confidence === 'Medium' ? 'text-secondary border-secondary/40' : 'text-muted-foreground border-border';
  const evidence = Array.isArray(savings.evidence) ? savings.evidence : [String(savings.evidence ?? '')];
  const assumptions = Array.isArray(savings.assumptions) ? savings.assumptions : [String(savings.assumptions ?? '')];
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="open" className="border-border/60 rounded-xl border bg-card/60 px-4 sm:px-5 print-card">
        <AccordionTrigger className="hover:no-underline py-4.5 py-4">
          <span className="flex items-center gap-3 text-left w-full">
            <span className="flex-1 min-w-0">
              <span className="font-semibold text-sm sm:text-base block">{savings.title}</span>
              <span className="text-xs text-muted-foreground">Estimated potential: {money(savings.savingsMin)} - {money(savings.savingsMax)}/yr</span>
            </span>
            <Badge variant="outline" className={`shrink-0 font-bold ${confColor}`}>{savings.confidence} confidence</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> The problem</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{savings.problem}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Evidence from your audit</div>
                <ul className="mt-1.5 space-y-1">
                  {evidence.map((e, i) => (
                    <li key={i} className="text-xs font-mono bg-background/60 border border-border/50 rounded px-2.5 py-1.5 break-words">{e}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><PiggyBank className="h-3 w-3" /> What it is probably costing</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{savings.cost}</p>
              </div>
            </div>
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5"><Wrench className="h-3 w-3" /> The fix</div>
                <p className="mt-1 text-sm leading-relaxed">{savings.fix}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-secondary">Next step</div>
                <p className="mt-1 text-sm leading-relaxed">{savings.nextStep}</p>
              </div>
              <div className="rounded-lg border border-secondary/25 bg-secondary/5 p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-secondary">Illustrative savings: {money(savings.savingsMin)} - {money(savings.savingsMax)}/yr</div>
                <ul className="mt-1.5 space-y-0.5">
                  {assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground">- {a}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">{savings.basis}</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SavingsCalculator() {
  const [visitors, setVisitors] = useState(2000);
  const [adSpend, setAdSpend] = useState(250);
  const [retainer, setRetainer] = useState(500);
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(50);
  const [hosting, setHosting] = useState(40);

  const calc = useMemo(() => {
    const tools = [240, 1440];
    const speed = [Math.round(hosting * 12 * 0.3), Math.round(hosting * 12 * 0.8) + 240];
    const convert = [Math.round(adSpend * 12 * 0.2), Math.round(adSpend * 12 * 0.5)];
    const automation = [Math.round(hours * rate * 12 * 0.5), Math.round(hours * rate * 12 * 0.75)];
    const content = retainer > 0 ? [Math.round(retainer * 12 * 0.3), Math.round(retainer * 12 * 0.6)] : [600, 2400];
    const trafficUpside = [Math.round(visitors * 0.5 * 2), Math.round(visitors * 1 * 8)];
    const totalMin = tools[0] + speed[0] + convert[0] + automation[0] + content[0];
    const totalMax = tools[1] + speed[1] + convert[1] + automation[1] + content[1];
    return { tools, speed, convert, automation, content, trafficUpside, totalMin, totalMax };
  }, [visitors, adSpend, retainer, hours, rate, hosting]);

  const rows: Array<[string, string, number[]]> = [
    ['Tool consolidation', 'Overlapping subscriptions you could cancel', calc.tools],
    ['Hosting / speed', 'Hosting or CDN right-sizing', calc.speed],
    ['Conversion lift', 'More leads from the ad budget you already have', calc.convert],
    ['Automating chores', 'Hours saved on repetitive marketing work', calc.automation],
    ['Content production', 'P&R content replacing part of a content budget', calc.content],
  ];

  const fields: Array<[string, number, (v: number) => void, number, number, number]> = [
    ['Monthly website visitors', visitors, setVisitors, 100, 50000, 100],
    ['Monthly ad / paid budget ($)', adSpend, setAdSpend, 0, 10000, 25],
    ['Agency / freelancer retainer ($/mo)', retainer, setRetainer, 0, 10000, 50],
    ['Hours per month on marketing chores', hours, setHours, 0, 80, 1],
    ['Value of your hour ($)', rate, setRate, 15, 250, 5],
    ['Hosting / tools cost ($/mo)', hosting, setHosting, 0, 1000, 5],
  ];

  return (
    <section id="calculator" className="mt-8 scroll-mt-24">
      <Card className="border-secondary/30 bg-card/70 print-card">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Calculator className="h-5 w-5 text-secondary" /> PERSONALIZED SAVINGS CALCULATOR
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit the assumptions to match your business. The ranges update instantly. This is an estimating tool
            based on your audit findings and your inputs - not a quote or a guarantee.
          </p>
          <div className="mt-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div className="space-y-4">
              {fields.map(([label, value, setter, min, max, step]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <Label className="text-muted-foreground">{label}</Label>
                    <span className="font-mono font-bold text-foreground">{value.toLocaleString('en-US')}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    aria-label={label}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 text-center">
                <div className="text-[11px] font-bold uppercase tracking-widest text-secondary">Total illustrative potential</div>
                <div className="mt-1 font-mono font-black text-3xl sm:text-4xl text-secondary">
                  {money(calc.totalMin)} - {money(calc.totalMax)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">per year, if the fixes above are made</div>
              </div>
              <div className="mt-4 space-y-2">
                {rows.map(([t, d, [min, max]]) => (
                  <div key={t} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/40 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{t}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{d}</div>
                    </div>
                    <span className="font-mono text-sm text-secondary shrink-0">{money(min)}-{money(max)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
                Scenario math: tool savings assume 1-3 removable subscriptions; hosting assumes 30-80% right-sizing
                of your entered cost; conversion assumes a 20-50% relative lift on your entered ad budget; automation
                values 50-75% of your entered chore hours at your hourly rate; content replaces 30-60% of your
                retainer (or a typical package if none). Traffic upside is intentionally excluded from the total
                because it is the least certain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function AiReadinessCard({ report, navigate }: { report: AuditReport; navigate: (to: string) => void }) {
  const policyIcon = (p: string) =>
    p === 'allowed' ? <Check className="h-3.5 w-3.5 text-primary" /> : p === 'blocked' ? <X className="h-3.5 w-3.5 text-red-400" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  return (
    <Card className="border-border/70 bg-card/70 print-card">
      <CardContent className="p-6">
        <h2 className="font-black tracking-tight flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> AI SEARCH READINESS
        </h2>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Readiness, not a guarantee: we measure whether AI assistants <em>can</em> read, understand and quote
          your site. Actual citations depend on many factors nobody controls.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3.5 py-2.5 text-sm">
            <span>llms.txt</span>
            <Badge variant="outline" className={report.aiReadiness.llmsTxt.found ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}>
              {report.aiReadiness.llmsTxt.found ? `Found (${report.aiReadiness.llmsTxt.bytes} bytes)` : 'Not found'}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3.5 py-2.5 text-sm">
            <span>Question-shaped headings</span>
            <span className="font-mono font-bold">{report.aiReadiness.questionHeadings}</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/40 px-3.5 py-2.5">
            <div className="text-sm mb-2">AI crawler access (robots.txt)</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {report.aiReadiness.crawlers.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs font-mono">
                  {policyIcon(c.policy)}
                  <span className="truncate text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
          {report.aiReadiness.schemaTypes.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-background/40 px-3.5 py-2.5">
              <div className="text-sm mb-1.5">Structured data types found</div>
              <div className="flex flex-wrap gap-1.5">
                {report.aiReadiness.schemaTypes.slice(0, 10).map((t) => (
                  <Badge key={t} variant="outline" className="border-primary/30 text-primary text-[10px] font-mono">{t}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-sm">
            {report.aiReadiness.verdict}
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4 border-primary/40 text-primary hover:bg-primary/10" onClick={() => navigate('/learn/how-to-appear-in-chatgpt-search')}>
          HOW TO SHOW UP IN AI SEARCH <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

function LeadCapture({ auditId }: { auditId: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!email || !consent) {
      toast({ title: 'Almost there', description: 'Enter your email and tick the consent box.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/audit/${auditId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      setDone(true);
      toast({ title: 'Saved', description: data.note });
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-10 print-hidden rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6">
      <h3 className="font-bold flex items-center gap-2"><Mail className="h-4.5 w-4.5 h-5 w-5 text-primary" /> WANT A COPY OF THIS REPORT BY EMAIL?</h3>
      {done ? (
        <p className="mt-2.5 text-sm text-primary flex items-center gap-1.5"><Check className="h-4 w-4" /> You are on the list. Your report link stays available too.</p>
      ) : (
        <>
          <p className="mt-1.5 text-xs text-muted-foreground">Optional. We store your email only to send this report and audit reminders. No spam, no selling data.</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
            <Input type="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/60" aria-label="Email address" />
            <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SEND ME THE REPORT'}
            </Button>
          </div>
          <label className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} aria-label="Consent to receive the report by email" />
            I agree to receive this report by email and understand I can unsubscribe anytime.
          </label>
        </>
      )}
    </section>
  );
}
