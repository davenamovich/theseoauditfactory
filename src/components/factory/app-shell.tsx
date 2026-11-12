'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen, Factory, Github, Info, Menu, Moon, ScanSearch, Settings2, ShieldCheck, Sun, Tags,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useHashRoute, type Route } from './router';
import { HomeView } from './views/home-view';
import { AuditView } from './views/audit-view';
import { ReportView } from './views/report-view';
import { ContentStudio } from './views/studio-view';
import { HubView, ArticleView, GlossaryView, ResourcesView } from './views/knowledge-views';
import { OffersView } from './views/offers-view';
import { AboutView } from './views/about-view';
import { AdminView } from './views/admin-view';
import type { StartAuditPayload } from './types';

const NAV: Array<{ label: string; to: string; icon: typeof BookOpen }> = [
  { label: 'Free Audit', to: '/', icon: ScanSearch },
  { label: 'Learn', to: '/learn', icon: BookOpen },
  { label: 'Glossary', to: '/glossary', icon: BookOpen },
  { label: 'Resources', to: '/resources', icon: BookOpen },
  { label: 'Offers', to: '/offers', icon: Tags },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Admin', to: '/admin', icon: Settings2 },
];

function ThemeToggle() {
  const { setTheme } = useTheme();
  // CSS-driven icon swap: html carries `class="dark"` from SSR, so no
  // hydration-sensitive state is needed.
  return (
    <button
      onClick={() => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
      aria-label="Toggle color theme"
      className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/60 hover:border-primary/45 transition-colors"
    >
      <Sun className="hidden h-4 w-4 dark:inline-block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}

export function AppShell() {
  const [route, navigate] = useHashRoute();
  const [starting, setStarting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();

  const startAudit = useCallback(
    async (payload: StartAuditPayload) => {
      setStarting(true);
      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          toast({
            title: data.quotaReached ? 'Free audits for today are used up' : 'Could not start audit',
            description: data.error ?? 'Please try again.',
          });
          return;
        }
        if (data.cached && data.shareId) {
          toast({ title: 'Recent audit found', description: data.note ?? 'Serving the recent result.' });
          navigate(`/report/${data.shareId}`);
          return;
        }
        navigate(`/audit/${data.id}`);
      } catch {
        toast({ title: 'Network error', description: 'Could not start the audit. Try again.' });
      } finally {
        setStarting(false);
      }
    },
    [navigate, toast]
  );

  // Stable route key: `route` is a fresh object each render (parseHash), so
  // depending on it directly would close the mobile sheet the moment it opens.
  const routeKey = `${route.view}:${'id' in route ? String((route as { id?: string }).id ?? '') : ''}`;
  useEffect(() => {
    setMobileOpen(false);
  }, [routeKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* HEADER */}
      <header className="print-hidden sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group" aria-label="The SEO Audit Factory home">
            <span className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Factory className="h-5 w-5 text-primary" />
            </span>
            <span className="leading-tight text-left">
              <span className="block font-black tracking-tight text-sm">THE SEO AUDIT FACTORY</span>
              <span className="block text-[10px] text-muted-foreground">Free audits · Five ways to save · Free content</span>
            </span>
          </button>

          <nav aria-label="Main navigation" className="ml-auto hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(route, item.to);
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-black" onClick={() => navigate('/')}>
                GET MY FREE AUDIT
              </Button>
            </div>
          </nav>

          <div className="ml-auto lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-border/60" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border/60 w-72">
                <SheetTitle className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" /> Navigation
                </SheetTitle>
                <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <button
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(route, item.to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                      }`}
                    >
                      <item.icon className="h-4 w-4" /> {item.label}
                    </button>
                  ))}
                </nav>
                <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black" onClick={() => navigate('/')}>
                  GET MY FREE AUDIT
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main id="main" className="flex-1">
        {route.view === 'home' && <HomeView navigate={navigate} onStartAudit={startAudit} starting={starting} />}
        {route.view === 'audit' && <AuditView id={route.id} navigate={navigate} />}
        {route.view === 'report' && <ReportView id={route.id} navigate={navigate} />}
        {route.view === 'studio' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">CONTENT STUDIO</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free sample marketing assets through the live Plunder &amp; Riffle MCP. Run an audit first so the
              generator knows your business.
            </p>
            {route.id ? (
              <div className="mt-7">
                <ContentStudio auditId={route.id} />
              </div>
            ) : (
              <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={() => navigate('/')}>
                RUN MY FREE AUDIT FIRST
              </Button>
            )}
          </div>
        )}
        {route.view === 'learn' && <HubView navigate={navigate} />}
        {route.view === 'article' && <ArticleView slug={route.slug} navigate={navigate} />}
        {route.view === 'glossary' && <GlossaryView navigate={navigate} />}
        {route.view === 'resources' && <ResourcesView navigate={navigate} />}
        {route.view === 'offers' && <OffersView />}
        {route.view === 'about' && <AboutView navigate={navigate} />}
        {route.view === 'admin' && <AdminView />}
      </main>

      {/* FOOTER - sticky bottom via flex + mt-auto on parent */}
      <footer className="print-hidden mt-auto border-t border-border/60 bg-card/40 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
                <Factory className="h-4 w-4 text-primary" />
              </span>
              <span className="font-black tracking-tight text-sm">THE SEO AUDIT FACTORY</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Free SEO audits. Smarter marketing. More customers. Less wasted money. Operated by Plunder &amp; Riffle.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Estimates are illustrative. We never fake data.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ['Free audit', '/'],
                ['Knowledge center', '/learn'],
                ['SEO glossary', '/glossary'],
                ['Free SEO resources', '/resources'],
                ['Offers & deals', '/offers'],
                ['About & methodology', '/about'],
              ].map(([label, to]) => (
                <li key={to}>
                  <button onClick={() => navigate(to)} className="text-muted-foreground hover:text-primary transition-colors">{label}</button>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Powered by</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Agent 37 - autonomous agent pipeline</li>
              <li>
                <a href="https://www.plunderandriffle.com/whop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                  Plunder &amp; Riffle MCP <Github className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://github.com/AgriciDaniel/claude-seo" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                  Claude SEO methodology (MIT) <Github className="h-3 w-3" />
                </a>
              </li>
              <li>Z.ai - development &amp; AI orchestration</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>© {new Date().getFullYear()} Plunder &amp; Riffle. The SEO Audit Factory.</span>
            <span className="font-mono">llms.txt · robots.txt · schema.org · no spam, ever</span>
          </div>
        </div>
      </footer>

      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': '#organization',
                name: 'The SEO Audit Factory',
                description: 'Free SEO audits with real crawling, five money-saving recommendations and free marketing content. Operated by Plunder & Riffle.',
                url: '/',
                parentOrganization: { '@type': 'Organization', name: 'Plunder & Riffle', url: 'https://www.plunderandriffle.com' },
              },
              {
                '@type': 'WebSite',
                '@id': '#website',
                name: 'The SEO Audit Factory',
                inLanguage: 'en',
                publisher: { '@id': '#organization' },
              },
              {
                '@type': 'WebApplication',
                name: 'The SEO Audit Factory - Free SEO Audit',
                applicationCategory: 'BusinessApplication',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              },
            ],
          }),
        }}
      />
    </div>
  );
}

function isActive(route: Route, to: string): boolean {
  if (to === '/') return route.view === 'home' || route.view === 'audit' || route.view === 'report';
  if (to === '/learn') return route.view === 'learn' || route.view === 'article' || route.view === 'glossary' || route.view === 'resources';
  switch (to) {
    case '/glossary':
      return route.view === 'glossary';
    case '/resources':
      return route.view === 'resources';
    case '/offers':
      return route.view === 'offers';
    case '/about':
      return route.view === 'about';
    case '/admin':
      return route.view === 'admin';
    default:
      return false;
  }
}
