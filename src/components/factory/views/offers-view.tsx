'use client';

// The one-page offers hub. Tactful by design: the audit and the free samples
// stay free, the toolbox is presented as "what's behind the factory" with an
// honest disclosure. Includes the complimentary iMessage thread and meme
// strip that carry the visitor on the same journey as their audit.

import { useEffect } from 'react';
import { ArrowRight, BadgeCheck, Coffee, CreditCard, Factory, Laugh, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneFrame, PhoneScreenShell } from '../phone-frame';

function track(kind: string, meta: Record<string, unknown>): void {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, meta }),
  }).catch(() => undefined);
}

function openOffer(url: string, offer: string): void {
  track('pnr_click', { source: 'offers-view', offer });
  window.open(url, '_blank', 'noopener,noreferrer');
}

const OFFERS = [
  {
    id: 'agent-37',
    icon: Coffee,
    badge: 'POWERS THIS FACTORY',
    name: 'Agent 37',
    hook: 'Run your whole marketing department for less than a Starbucks.',
    body:
      'The autonomous agent pipeline behind your audit and content studio. It drafts the memes, schedules the posts and follows up - while you actually run the business. One agent, no agency retainer.',
    cta: 'MEET AGENT 37',
    url: 'https://www.plunderandriffle.com/whop',
  },
  {
    id: 'whop',
    icon: CreditCard,
    badge: 'LOWEST FEES WE KNOW',
    name: 'Whop',
    hook: 'Sell anything online. 2.7% credit card fees.',
    body:
      'The storefront we point every creator and small business to: memberships, digital products, services. Keep your margin instead of feeding the fee stack - every percent stays yours.',
    cta: 'VISIT WHOP',
    url: 'https://whop.com',
  },
  {
    id: 'pnr',
    icon: Laugh,
    badge: '18 REAL TOOLS, LIVE MCP',
    name: 'Plunder & Riffle',
    hook: 'Memes, videos, iMessage threads - on tap.',
    body:
      'The creative engine that generated your free /BEFORE and content samples. Previews before anything is published, refunds on failure, and a meme journey for every brand brave enough to start.',
    cta: 'EXPLORE P&R',
    url: 'https://www.plunderandriffle.com/whop',
  },
];

const THREAD: Array<{ from: 'them' | 'me'; text: string }> = [
  { from: 'them', text: 'wait, the audit was actually free?' },
  { from: 'me', text: 'zero dollars. it crawled my whole site' },
  { from: 'them', text: 'and it made memes about MY website?' },
  { from: 'me', text: 'the /before thing. joe roasts your homepage with love' },
  { from: 'them', text: 'ok what is the catch' },
  { from: 'me', text: 'no catch. the toolbox is there if you want the after' },
  { from: 'me', text: 'agent 37 runs my marketing for less than my coffee order' },
  { from: 'them', text: 'and the card fees on whop??' },
  { from: 'me', text: '2.7%. i checked twice' },
  { from: 'them', text: 'sending you my site now' },
];

export function OffersView() {
  useEffect(() => {
    track('resources_view', { view: 'offers' });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-secondary uppercase">
          <Factory className="h-3.5 w-3.5" /> One page, no pressure
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          THE TOOLBOX BEHIND <span className="text-primary">THE FACTORY</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Everything on this page is optional. The audit, the report, the savings estimates and your free
          /BEFORE stay free - these are just the tools we built the factory with, in case you want the
          glow-up to keep going.
        </p>
      </div>

      {/* Offer cards */}
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {OFFERS.map((offer) => {
          const Icon = offer.icon;
          return (
            <Card key={offer.id} className="border-border/60 bg-card/70 card-sheen hover:border-primary/40 transition-colors">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-4 text-[10px] font-black tracking-widest text-secondary">{offer.badge}</p>
                <h2 className="mt-1 text-lg font-black tracking-tight">{offer.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-snug">{offer.hook}</p>
                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed flex-1">{offer.body}</p>
                <Button
                  className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black"
                  onClick={() => openOffer(offer.url, offer.id)}
                >
                  {offer.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Complimentary iMessage thread + meme strip */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[auto_1fr] items-center">
        <div className="mx-auto lg:mx-0">
          <PhoneFrame>
            <PhoneScreenShell title="Messages · the honest thread">
              <div className="flex flex-col gap-1.5 pt-1">
                {THREAD.map((m, i) => (
                  <div key={i} className={m.from === 'me' ? 'self-end' : 'self-start'} style={{ maxWidth: '85%' }}>
                    <div
                      className={
                        m.from === 'me'
                          ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-medium leading-snug'
                          : 'rounded-2xl rounded-bl-sm bg-zinc-800 text-zinc-100 px-3 py-1.5 text-[11px] font-medium leading-snug'
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </PhoneScreenShell>
          </PhoneFrame>
          <p className="mt-2 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <MessageSquare className="h-3 w-3" /> The complimentary iMessage every visitor gets to send
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">
            THE MEME JOURNEY, <span className="text-secondary">CONTINUED</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
            Your audit already gave you the honest before. Here are the two frames everybody else keeps
            private - on the house, no signup, no watermark circus.
          </p>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-zinc-950 text-center px-6 py-10 select-none" aria-label="Meme: generating the free before at 2am">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">me, 2:04 am</p>
              <p className="mt-2 text-lg sm:text-xl font-black uppercase leading-tight text-zinc-100">
                &ldquo;just one free /before before bed&rdquo;
              </p>
              <p className="mt-3 text-[11px] text-zinc-500">the before: five custom examples deep</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-zinc-950 text-center px-6 py-10 select-none" aria-label="Meme: the audit is free, the glow-up is optional">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">the factory pricing tier</p>
              <p className="mt-2 text-lg sm:text-xl font-black uppercase leading-tight text-zinc-100">
                audit: free · before: free
              </p>
              <p className="mt-2 text-lg sm:text-xl font-black uppercase leading-tight text-secondary">
                glow-up: optional
              </p>
              <p className="mt-3 text-[11px] text-zinc-500">memes: on the house, forever</p>
            </div>
          </div>
        </div>
      </div>

      {/* Honest footer */}
      <div className="mt-14 rounded-xl border border-border/60 bg-background/30 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" aria-hidden />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">The honest part:</span> links open in a new tab and we may earn a
          referral. Nothing here is required - no paywall ever hides an audit result, and the free tier never expires
          into a bill. Estimates and offers are illustrative, never fabricated data.
        </div>
      </div>
    </div>
  );
}
