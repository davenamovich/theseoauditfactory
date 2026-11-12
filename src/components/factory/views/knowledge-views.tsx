'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, BookMarked, ChevronRight, ExternalLink, LibraryBig,
  Search, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ARTICLES_A } from '@/content/articles-a';
import { ARTICLES_B } from '@/content/articles-b';
import { GLOSSARY } from '@/content/articles-b';
import { RESOURCE_LINKS } from '@/content/articles-b';
import { ALL_CATEGORIES, CATEGORY_DESCRIPTIONS, type ArticleCategory } from '@/content/types';
import { PnRBanner } from '../pnr-banner';
import type { Route } from '../router';

const ALL_ARTICLES = [...ARTICLES_A, ...ARTICLES_B];

export function HubView({ navigate }: { navigate: (to: string) => void }) {
  const [category, setCategory] = useState<ArticleCategory | 'All'>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return ALL_ARTICLES.filter((a) => {
      const matchesCat = category === 'All' || a.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.intro.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-primary font-bold">Knowledge center</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">SEO, EXPLAINED LIKE YOU HAVE A BUSINESS TO RUN</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Straight answers, checklists and playbooks. No invented statistics, no promised rankings. Written to be
          useful enough that AI assistants can safely quote it - and you can act on it.
        </p>
      </div>

      <div className="mt-7 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search guides..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-background/60" aria-label="Search guides" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c as ArticleCategory | 'All')}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                category === c ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/35 hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {category !== 'All' && <p className="mt-2.5 text-xs text-muted-foreground">{CATEGORY_DESCRIPTIONS[category as ArticleCategory]}</p>}

      <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <button
            key={a.slug}
            onClick={() => navigate(`/learn/${a.slug}`)}
            className="text-left rounded-xl border border-border/70 bg-card/70 p-5 hover:border-primary/45 hover:bg-card transition-colors card-sheen flex flex-col"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{a.category}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{a.readMinutes} min</span>
            </div>
            <h2 className="mt-2 font-bold leading-snug">{a.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3 flex-1">{a.description}</p>
            <span className="mt-3 text-[11px] text-muted-foreground font-mono">Updated {a.updated}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">Nothing matches that search. Try a broader term.</p>
        )}
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/glossary')}
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-5 hover:border-primary/45 transition-colors text-left"
        >
          <BookMarked className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <div className="font-bold">SEO Glossary</div>
            <div className="text-sm text-muted-foreground">{GLOSSARY.length} terms in plain English.</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => navigate('/resources')}
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-5 hover:border-primary/45 transition-colors text-left"
        >
          <LibraryBig className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <div className="font-bold">Free SEO Resources</div>
            <div className="text-sm text-muted-foreground">{RESOURCE_LINKS.length} free tools from primary sources.</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-12">
        <PnRBanner />
      </div>
    </div>
  );
}

export function ArticleView({ slug, navigate }: { slug: string; navigate: (to: string) => void }) {
  const article = ALL_ARTICLES.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'article_view', ref: article.slug }),
      }).catch(() => undefined);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black">Article not found</h1>
        <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/learn')}>
          BACK TO KNOWLEDGE CENTER
        </Button>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={() => navigate('/learn')} className="hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Knowledge center
        </button>
        <span>/</span>
        <span className="text-foreground">{article.category}</span>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="border-primary/40 text-primary font-bold">{article.category}</Badge>
          <span>{article.readMinutes} min read</span>
          <span>·</span>
          <span>Updated {article.updated}</span>
          <span>·</span>
          <span>Reviewed quarterly</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight leading-tight">{article.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/50 pl-4">{article.intro}</p>
      </header>

      <section className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary">Key takeaways</h2>
        <ul className="mt-3 space-y-1.5">
          {article.keyTakeaways.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed"><span className="text-primary shrink-0">»</span>{t}</li>
          ))}
        </ul>
      </section>

      <div className="mt-9 space-y-8">
        {article.sections.map((s, i) => (
          <section key={i}>
            <h2 className={s.level === 3 ? 'text-lg font-bold mt-2' : 'text-xl font-black tracking-tight'}>{s.heading}</h2>
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-3 space-y-1.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2.5 text-[15px] text-muted-foreground leading-relaxed">
                    <span className="text-primary shrink-0 mt-0.5">–</span>{b}
                  </li>
                ))}
              </ul>
            )}
            {s.steps && (
              <ol className="mt-3 space-y-2.5">
                {s.steps.map((st, j) => (
                  <li key={j} className="flex gap-3 text-[15px] text-muted-foreground leading-relaxed">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10 border border-primary/35 text-primary text-xs font-black flex items-center justify-center">{j + 1}</span>
                    <span className="pt-0.5">{st}</span>
                  </li>
                ))}
              </ol>
            )}
            {s.callout && (
              <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm leading-relaxed">{s.callout}</div>
            )}
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-black tracking-tight">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {article.faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mt-9 grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Sources</h2>
          <ul className="mt-2.5 space-y-1.5">
            {article.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  {s.label} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Keep reading</h2>
          <ul className="mt-2.5 space-y-1.5">
            {article.related.map((slug) => {
              const rel = ALL_ARTICLES.find((a) => a.slug === slug);
              if (!rel) return null;
              return (
                <li key={slug}>
                  <button onClick={() => navigate(`/learn/${slug}`)} className="text-sm text-primary hover:underline inline-flex items-center gap-1 text-left">
                    {rel.title} <ArrowRight className="h-3 w-3 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-primary/30 bg-card p-6 text-center card-sheen">
        <BookOpen className="h-6 w-6 text-primary mx-auto" />
        <h2 className="mt-2 text-xl font-black tracking-tight">PUT THIS INTO PRACTICE IN 60 SECONDS</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Run the free audit and see exactly which of these apply to your site.</p>
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-black" onClick={() => navigate('/')}>
          <Sparkles className="h-4 w-4 mr-1.5" /> GET MY FREE AUDIT
        </Button>
      </section>

      <div className="mt-8">
        <PnRBanner />
      </div>
    </article>
  );
}

export function GlossaryView({ navigate }: { navigate: (to: string) => void }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'glossary_view' }) }).catch(() => undefined);
  }, []);
  const filtered = GLOSSARY.filter(
    (t) => !query.trim() || t.term.toLowerCase().includes(query.toLowerCase()) || t.definition.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <button onClick={() => navigate('/learn')} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Knowledge center
      </button>
      <h1 className="mt-4 text-3xl font-black tracking-tight">SEO GLOSSARY</h1>
      <p className="mt-2 text-muted-foreground">{GLOSSARY.length} terms, defined in plain English for business owners.</p>
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search terms..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-background/60" aria-label="Search glossary" />
      </div>
      <dl className="mt-7 space-y-3">
        {filtered.map((t) => (
          <div key={t.slug} className="rounded-xl border border-border/60 bg-card/60 p-4.5 p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="font-bold">{t.term}</dt>
              <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">{t.category}</Badge>
            </div>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{t.definition}</dd>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No terms match that search.</p>}
      </dl>
    </div>
  );
}

export function ResourcesView({ navigate }: { navigate: (to: string) => void }) {
  useEffect(() => {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'resources_view' }) }).catch(() => undefined);
  }, []);
  const categories = [...new Set(RESOURCE_LINKS.map((r) => r.category))];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <button onClick={() => navigate('/learn')} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Knowledge center
      </button>
      <h1 className="mt-4 text-3xl font-black tracking-tight">FREE SEO RESOURCES</h1>
      <p className="mt-2 text-muted-foreground">
        Free tools and documentation from the primary sources. When a task needs an official tool, use the official tool.
      </p>
      {categories.map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">{cat}</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {RESOURCE_LINKS.filter((r) => r.category === cat).map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border/60 bg-card/60 p-4 hover:border-primary/45 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {r.name}
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
      <div className="mt-10">
        <PnRBanner />
      </div>
    </div>
  );
}
