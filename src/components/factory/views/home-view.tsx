'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Bot, ChevronDown, ClipboardList, Cpu, Gauge, Loader2, MapPin,
  PiggyBank, Search, ShieldCheck, Sparkles, Wrench, Zap, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PhoneFrame } from '../phone-frame';
import { HeroDemoScreen, AuditResultsScreen, SavingsScreen, AiVisibilityScreen, BeforeAfterScreen, MemeScreen, SocialScreen } from '../screens';
import { PnRBanner } from '../pnr-banner';
import { ARTICLES_A } from '@/content/articles-a';
import { ARTICLES_B } from '@/content/articles-b';
import type { StartAuditPayload } from '../types';

const ALL_ARTICLES = [...ARTICLES_A, ...ARTICLES_B];

const MODULES = [
  {
    icon: Wrench,
    title: 'Technical SEO',
    checks: 'Crawlability, robots.txt, sitemap, canonicals, redirects, HTTPS, security headers, broken links, mobile viewport',
  },
  {
    icon: ClipboardList,
    title: 'On-Page & Content',
    checks: 'Titles, meta descriptions, H1/H2 structure, image alt text, internal links, thin and duplicate content, freshness',
  },
  {
    icon: Bot,
    title: 'AI Search / GEO / AEO',
    checks: 'llms.txt, AI crawler access, structured data, question-shaped headings, answer formatting, machine-readable contact info',
  },
  {
    icon: MapPin,
    title: 'Local SEO',
    checks: 'LocalBusiness schema, click-to-call, address signals, NAP checks, hours, location in titles, map embeds',
  },
  {
    icon: Gauge,
    title: 'Performance',
    checks: 'Server response time (TTFB), HTML weight, script bloat, marketing tag inventory, lazy loading, compression, caching',
  },
  {
    icon: PiggyBank,
    title: 'Money-Saving Analyst',
    checks: 'Five personalized opportunities translating findings into business economics, with editable assumptions',
  },
];

const GALLERY = [
  { screen: <AuditResultsScreen />, caption: 'Every finding: severity, evidence, plain-English fix' },
  { screen: <SavingsScreen />, caption: 'Five ways you are losing money, with real evidence' },
  { screen: <AiVisibilityScreen />, caption: 'AI search readiness: who can read and cite you' },
  { screen: <BeforeAfterScreen />, caption: 'Fix, re-run, and compare progress' },
  { screen: <MemeScreen />, caption: 'Free P&R memes built from your audit' },
  { screen: <SocialScreen />, caption: 'Turn your own pages into social content' },
];

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. The audit, the report and the five money-saving recommendations are free, with no credit card and no forced signup. You can also generate a limited number of free sample marketing assets from your report.',
  },
  {
    q: 'What do you actually check?',
    a: 'Our crawler requests your homepage, robots.txt, sitemap and llms.txt, samples internal pages and links, then analyzes technical SEO, on-page content, AI search readiness (GEO/AEO), local signals and performance. Every finding cites the evidence we collected.',
  },
  {
    q: 'How long does an audit take?',
    a: 'Usually under two minutes. Complex or slow sites can take longer because we wait for real responses instead of guessing.',
  },
  {
    q: 'Will you spam me or sell my data?',
    a: 'No. We store the audit result so you can share the report link. Email capture is optional and requires explicit consent. We do not sell data.',
  },
  {
    q: 'Can you guarantee AI citations or rankings?',
    a: "No, and nobody honestly can. We clearly separate technical readiness (what we measure) from outcomes like rankings or AI citations, which depend on many factors outside any tool's control.",
  },
  {
    q: 'Some sites block audits. What then?',
    a: 'If your host blocks our crawler (a 403), we tell you exactly that instead of faking a score. You can allowlist our user agent (SeoAuditFactoryBot) and re-run.',
  },
];

export function HomeView({ navigate, onStartAudit, starting }: {
  navigate: (to: string) => void;
  onStartAudit: (payload: StartAuditPayload) => void;
  starting: boolean;
}) {
  const [url, setUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [recent, setRecent] = useState<Array<{ shareId: string; host: string; score: number | null }>>([]);

  useEffect(() => {
    fetch('/api/audits/recent')
      .then((r) => r.json())
      .then((d) => setRecent(d.audits ?? []))
      .catch(() => undefined);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim() || starting) return;
    onStartAudit({
      url,
      businessName: businessName || undefined,
      industry: industry || undefined,
      location: location || undefined,
    });
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow pointer-events-none" aria-hidden />
        <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Free audit · No signup · No credit card
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.04] tracking-tight">
              YOUR WEBSITE IS LEAVING{' '}
              <span className="text-primary text-glow">MONEY</span> ON THE TABLE.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Find out what&apos;s costing you customers, what&apos;s wasting your marketing budget, and how to get
              discovered on Google and AI search. Get your free SEO audit and five money-saving
              recommendations. Then create free marketing content to put your business in front of more people.
            </p>

            <Card className="mt-7 border-primary/25 bg-card/90 backdrop-blur">
              <CardContent className="p-4 sm:p-5">
                <form onSubmit={submit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        aria-label="Website URL"
                        placeholder="yourbusiness.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-9 h-12 text-base bg-background/60"
                        inputMode="url"
                        autoComplete="url"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={starting || !url.trim()}
                      className="h-12 px-6 font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {starting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                      {starting ? 'STARTING...' : 'GET MY FREE AUDIT'}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetails((s) => !s)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    aria-expanded={showDetails}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    Optional: business name, industry, location (sharpens local + AI checks)
                  </button>
                  {showDetails && (
                    <div className="grid sm:grid-cols-3 gap-2.5 enter-up">
                      <Input aria-label="Business name" placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="bg-background/60" />
                      <Input aria-label="Industry" placeholder="Industry (e.g. plumbing)" value={industry} onChange={(e) => setIndustry(e.target.value)} className="bg-background/60" />
                      <Input aria-label="Location" placeholder="City / service area" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-background/60" />
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Real crawling of your public pages. Results in about a minute.{' '}
                    <button type="button" onClick={() => navigate('/learn/free-seo-audit')} className="underline underline-offset-2 hover:text-primary">
                      What we check
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Evidence-based findings</span>
              <span className="inline-flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-primary" /> AI-search ready checks</span>
              <span className="inline-flex items-center gap-1.5"><PiggyBank className="h-3.5 w-3.5 text-primary" /> Five savings opportunities</span>
            </div>
          </div>

          {/* Hero phone */}
          <div className="flex justify-center lg:justify-end">
            <motion.div initial={{ opacity: 0, y: 24, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
              <PhoneFrame>
                <HeroDemoScreen />
              </PhoneFrame>
            </motion.div>
          </div>
        </div>

        {/* Recent audits ticker */}
        {recent.length > 0 && (
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="rounded-xl border border-border/60 bg-card/50 px-4 py-2.5 flex items-center gap-3 overflow-x-auto scroll-slim">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">Recently audited</span>
              <div className="flex gap-2">
                {recent.slice(0, 8).map((r) => (
                  <button
                    key={r.shareId}
                    onClick={() => onStartAudit({ url: r.host })}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] hover:border-primary/50 transition-colors"
                    title={`Re-run audit for ${r.host}`}
                  >
                    <span className="text-muted-foreground">{r.host}</span>
                    {r.score !== null && <span className="font-mono font-bold text-primary">{r.score}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* POWERED BY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
          <span className="uppercase tracking-widest text-[10px] font-bold">Powered by</span>
          {[
            ['Agent 37', 'autonomous agents + persistent execution'],
            ['P&R MCP', 'Plunder & Riffle marketing content engine'],
            ['Claude SEO', 'audit methodology (MIT-licensed claude-seo)'],
            ['Z.ai', 'application development + AI orchestration'],
          ].map(([name, desc]) => (
            <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5" title={desc}>
              <Cpu className="h-3 w-3 text-primary" />
              <span className="font-semibold text-foreground">{name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* WHAT WE FIND - phone gallery + modules */}
      <section id="what-we-find" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">SEE WHAT WE FIND</h2>
          <p className="mt-3 text-muted-foreground">
            Not another vague score. Every finding cites the exact evidence from your site, explains why it
            matters in plain English, and tells you what to do next.
          </p>
        </div>

        <div className="mt-10 flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-slim lg:justify-center lg:flex-wrap lg:overflow-visible">
          {GALLERY.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="snap-center shrink-0 flex flex-col items-center gap-3"
            >
              <PhoneFrame glow={i % 2 ? 'amber' : 'teal'}>{g.screen}</PhoneFrame>
              <p className="text-xs text-muted-foreground max-w-[260px] text-center">{g.caption}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <Card key={m.title} className="border-border/70 bg-card/70 card-sheen hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <m.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold">{m.title}</h3>
                </div>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{m.checks}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center">THREE STEPS. ABOUT A MINUTE.</h2>
          <div className="mt-9 grid md:grid-cols-3 gap-4">
            {[
              { n: '01', t: 'Enter your URL', d: 'Just your website address. Business details are optional and sharpen the local and AI checks.', icon: Search },
              { n: '02', t: 'Agents crawl and analyze', d: 'Specialist agents fetch real pages, robots.txt, sitemaps and llms.txt, then run technical, content, AI-search, local and performance checks.', icon: Cpu },
              { n: '03', t: 'Get your report + free content', d: 'Scores, top problems, five money-saving opportunities, an action plan, and free sample marketing content from the P&R engine.', icon: PiggyBank },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border/70 bg-card/70 p-6 card-sheen">
                <span className="absolute top-4 right-5 font-mono text-3xl font-black text-muted-foreground/20">{s.n}</span>
                <s.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIVE WAYS TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              FIVE WAYS YOU&apos;RE <span className="text-secondary">LOSING MONEY</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              This is the part most graders skip. We translate audit findings into business economics: what the
              problem probably costs, the fix, an illustrative savings range, a confidence level, and the next
              step. When we can&apos;t see your invoices, we show scenarios with editable assumptions instead of
              inventing numbers.
            </p>
            <Button className="mt-5 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              RUN MY FREE AUDIT <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2.5">
            {[
              'Stop paying for unnecessary marketing tools',
              'Stop wasting money on slow websites',
              'Get more out of your existing website traffic',
              'Replace repetitive agency and content expenses',
              'Create more marketing content without hiring a production team',
            ].map((t, i) => (
              <div key={t} className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card/60 px-5 py-4 card-sheen">
                <span className="h-8 w-8 shrink-0 rounded-full bg-secondary/15 border border-secondary/30 text-secondary font-black flex items-center justify-center text-sm">{i + 1}</span>
                <span className="font-semibold text-sm sm:text-base">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KNOWLEDGE TEASER */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">LEARN THE GAME</h2>
              <p className="mt-2 text-muted-foreground text-sm">A genuinely useful SEO knowledge center - written for owners, not algorithms.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/learn')} className="border-primary/40 text-primary hover:bg-primary/10">
              <BookOpen className="h-4 w-4 mr-1.5" /> BROWSE ALL 18 GUIDES
            </Button>
          </div>
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_ARTICLES.slice(0, 6).map((a) => (
              <button
                key={a.slug}
                onClick={() => navigate(`/learn/${a.slug}`)}
                className="text-left rounded-xl border border-border/70 bg-card/70 p-5 hover:border-primary/45 hover:bg-card transition-colors card-sheen"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{a.category}</span>
                <h3 className="mt-1.5 font-bold leading-snug">{a.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                <span className="mt-2.5 inline-block text-[11px] text-muted-foreground font-mono">{a.readMinutes} min read · Updated {a.updated}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* P&R BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PnRBanner />
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center">STRAIGHT ANSWERS</h2>
          <Accordion type="single" collapsible className="mt-7">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 text-center card-sheen">
          <div className="absolute inset-0 hero-glow pointer-events-none" aria-hidden />
          <h2 className="relative text-3xl sm:text-4xl font-black tracking-tight">GET MY FREE AUDIT</h2>
          <p className="relative mt-3 text-muted-foreground max-w-xl mx-auto">
            Free SEO audit. Five ways to save money. Free marketing content. No credit card, no forced
            registration, no sales call.
          </p>
          <form onSubmit={submit} className="relative mt-6 flex flex-col sm:flex-row gap-2.5 max-w-lg mx-auto">
            <Input
              aria-label="Website URL"
              placeholder="yourbusiness.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-base bg-background/60"
            />
            <Button type="submit" disabled={starting || !url.trim()} className="h-12 px-6 font-black bg-primary text-primary-foreground hover:bg-primary/90">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'AUDIT MY SITE'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
