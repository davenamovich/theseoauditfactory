'use client';

import { Bot, Building2, ClipboardCheck, Cpu, FileText, Landmark, Lock, Mail, Scale, Search, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PnRBanner } from '../pnr-banner';
import type { Route } from '../router';

const AGENTS = [
  { n: 'Agent 1', t: 'Website Investigator', d: 'Crawls the target site: homepage, internal page samples, redirect chains, response headers.' },
  { n: 'Agent 2', t: 'Technical SEO Auditor', d: 'robots.txt, XML sitemap, canonicals, HTTPS, security headers, viewport, broken-link sampling, compression.' },
  { n: 'Agent 3', t: 'Content Strategist', d: 'Titles, descriptions, heading structure, alt text, internal linking, thin/duplicate content, freshness signals.' },
  { n: 'Agent 4', t: 'AI Search Specialist', d: 'llms.txt, AI crawler policies, structured data types, question-shaped headings, answer formatting, machine-readable contact info.' },
  { n: 'Agent 4b', t: 'Local SEO Specialist', d: 'LocalBusiness schema, click-to-call, address signals, NAP checks, hours, location-in-title, map embeds.' },
  { n: 'Agent 4c', t: 'Performance Specialist', d: 'TTFB, HTML weight, script inventory, marketing tag detection, lazy loading, compression, cache headers.' },
  { n: 'Agent 5', t: 'Money-Saving Analyst', d: 'Translates findings into five business-economics opportunities with evidence, scenarios and confidence levels.' },
  { n: 'Agent 6', t: 'P&R Content Creator', d: 'Calls the live Plunder & Riffle MCP to generate memes, graphics, videos and copy from your audit.' },
  { n: 'Agent 7', t: 'Report Writer', d: 'Combines everything into scores, findings, quick wins and the TODAY / THIS WEEK / THIS MONTH plan.' },
];

export function AboutView({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-primary font-bold">About</div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">THE SEO AUDIT FACTORY</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        The SEO Audit Factory is a free audit and education platform operated by{' '}
        <a href="https://www.plunderandriffle.com/whop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plunder &amp; Riffle (P&amp;R)</a>.
        Our pitch is simple: find out what your website is really doing, learn five specific ways to stop wasting
        marketing money, and turn what you already have into marketing content - without a sales call, a credit
        card, or a forced account.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <Card className="border-border/70 bg-card/60">
          <CardContent className="p-5">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-bold">Who operates this</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Plunder &amp; Riffle builds marketing content tools. The audit engine and knowledge center are ours;
              meme and video generation are powered by the P&amp;R MCP server you can inspect below.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/60">
          <CardContent className="p-5">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-bold">How audits actually work</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Specialist agents make real requests to your public pages: homepage, robots.txt, sitemap, llms.txt,
              sampled internal pages and links. Every finding cites the evidence we collected. No simulation, no
              fabricated scores.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/60">
          <CardContent className="p-5">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-bold">Methodology &amp; credits</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Our audit architecture is adapted from{' '}
              <a href="https://github.com/AgriciDaniel/claude-seo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">claude-seo</a>{' '}
              (MIT license) by Agrici Daniel - specialist agents for technical, content, schema, AI search and
              local SEO. We rebuilt it as a hosted web service with our own crawler, scoring and savings analyst.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/60">
          <CardContent className="p-5">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-bold">Honest limits</h2>
            <ul className="mt-1.5 text-sm text-muted-foreground leading-relaxed space-y-1">
              <li>- We measure technical readiness, not guaranteed rankings or AI citations.</li>
              <li>- Performance numbers are lab-style, single-location measurements, not Google field data.</li>
              <li>- We sample pages and links; we do not crawl your entire site.</li>
              <li>- Savings figures are illustrative scenarios with editable assumptions, never quotes.</li>
              <li>- Some hosts block crawlers; when they do, we say so instead of guessing.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight">THE AGENT LINEUP</h2>
        <div className="mt-4 rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {AGENTS.map((a) => (
                <tr key={a.n} className="border-b border-border/40 last:border-0 bg-background/30">
                  <td className="px-4 py-3 font-mono text-primary whitespace-nowrap align-top">{a.n}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap align-top">{a.t}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          In this deployment the agents run as an in-process pipeline with job tracking, retries, caching and rate
          limits. A persistent external Agent 37 runtime can be attached via configuration; the orchestration
          contract stays the same.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> PRIVACY</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
          <li>- We store the audit result (URL, host, scores, findings) so your share link works.</li>
          <li>- Email capture is optional and requires an explicit consent checkbox. We use it only for the report and audit reminders.</li>
          <li>- We do not sell data and we do not run third-party ad trackers on this site.</li>
          <li>- Audit crawling identifies itself as SeoAuditFactoryBot and respects timeouts, size caps and rate limits.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> FOR MACHINES &amp; AI ASSISTANTS</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This site publishes semantic HTML, descriptive metadata, Organization and WebSite structured data, an
          open robots.txt for search and AI crawlers, and an <code className="font-mono text-primary">/llms.txt</code>{' '}
          file describing the platform for AI assistants. Our knowledge center pages carry clear definitions,
          direct answers, step-by-step instructions and references to primary sources - the formats answer engines
          quote most reliably. We never promise citations in either direction.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> CONTACT</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Questions, corrections, crawl complaints or partnership ideas: reach us through{' '}
          <a href="https://www.plunderandriffle.com/whop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">plunderandriffle.com/whop</a>.
          If our crawler caused a problem on your site, tell us the URL and we will exclude it.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black" onClick={() => navigate('/')}>
          RUN THE FREE AUDIT
        </Button>
        <Button variant="outline" className="border-border" onClick={() => navigate('/learn')}>
          BROWSE THE KNOWLEDGE CENTER
        </Button>
      </div>

      <div className="mt-10">
        <PnRBanner />
      </div>
    </div>
  );
}
