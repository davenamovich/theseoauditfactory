'use client';

// The free "/BEFORE" - a complimentary before-pitch generated from the user's
// own website. Primary path: the real Plunder & Riffle MCP tool
// create_before_pitch (Joe's welcome + five custom examples). If no operator
// key is configured (or P&R fails), the clearly-labeled built-in AI engine
// generates the before instead. Either way the user gets a result, never an
// error dead-end.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera, Check, Clock, Copy, ExternalLink, Loader2, Sparkles, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PhoneThread, type PhoneThreadMessage } from './phone-thread';

interface BeforeResult {
  pageUrl?: string;
  mediaUrls?: string[];
  postCopy?: string;
  caption?: string;
  headline?: string;
  /** iMessage thread returned by the MCP call (or built-in engine). */
  thread?: PhoneThreadMessage[];
}

/** Persisted so the offers-page phone can replay the visitor's real thread. */
const BEFORE_STORE_KEY = 'saf:before-thread';

/** Prefer the real generated thread; otherwise synthesize bubbles from the
 * actual caption/copy so the phone shows what the engine produced, never a
 * canned chat. Used by both the render path and the persistence effect. */
function buildThreadMessages(r: BeforeResult): PhoneThreadMessage[] {
  if (r.thread?.length) return r.thread;
  const synth: PhoneThreadMessage[] = [];
  if (r.caption) {
    synth.push({ from: 'them', text: 'ok show me the honest before' });
    synth.push({ from: 'me', text: r.caption });
  }
  if (r.postCopy) synth.push({ from: 'me', text: r.postCopy });
  else if (r.headline) synth.push({ from: 'me', text: r.headline });
  return synth;
}

interface BeforeJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  provider?: string | null;
  toolName?: string | null;
  result?: BeforeResult | null;
  error?: string | null;
  creditsNote?: string | null;
}

const JOURNEY_LINES = [
  'Sending your website to the /before engine...',
  'Joe is reading your site like a detective...',
  'Writing five custom examples from your real pages...',
  'Filming the welcome...',
  'The before shot is developing...',
  'Adding the iMessage thread...',
];

function track(kind: string, ref: string, meta: Record<string, unknown>): void {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ref, meta }),
  }).catch(() => undefined);
}

export function BeforeCard({
  auditId,
  navigate,
}: {
  auditId: string;
  navigate: (to: string) => void;
}) {
  const { toast } = useToast();
  const [job, setJob] = useState<BeforeJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [journeyIdx, setJourneyIdx] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const journeyRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (journeyRef.current) clearInterval(journeyRef.current);
    pollRef.current = null;
    journeyRef.current = null;
  }, []);

  useEffect(() => stopTimers, [stopTimers]);

  // Adopt an existing /before job for this audit (so the card is stable
  // across reloads and the one-per-audit rule is visible).
  useEffect(() => {
    let alive = true;
    fetch(`/api/content/jobs?auditId=${encodeURIComponent(auditId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const existing = (data.jobs ?? []).find(
          (j: { assetType: string; status: string }) => j.assetType === 'before-pitch' && j.status !== 'failed'
        );
        if (existing) setJob(existing);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [auditId]);

  // Meme-journey ticker while working.
  useEffect(() => {
    const working = busy || job?.status === 'running' || job?.status === 'queued';
    if (!working) {
      if (journeyRef.current) clearInterval(journeyRef.current);
      journeyRef.current = null;
      return;
    }
    journeyRef.current = setInterval(() => setJourneyIdx((i) => (i + 1) % JOURNEY_LINES.length), 2600);
    return () => {
      if (journeyRef.current) clearInterval(journeyRef.current);
      journeyRef.current = null;
    };
  }, [busy, job?.status]);

  const pollJob = useCallback(
    (jobId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/content/jobs/${jobId}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.status !== 'running' && data.status !== 'queued') {
            stopTimers();
            const next: BeforeJob = {
              id: jobId,
              status: data.status,
              provider: data.provider,
              toolName: data.toolName,
              result: data.result,
              error: data.error,
              creditsNote: data.creditsNote,
            };
            setJob(next);
            setBusy(false);
            if (next.status === 'completed') {
              toast({ title: 'Your /BEFORE is ready', description: 'The honest before shot, built from your own website.' });
            }
          }
        } catch {
          /* keep polling */
        }
      }, 4000);
    },
    [stopTimers, toast]
  );

  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setJob(null);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, assetType: 'before-pitch' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        toast({ title: data.allowanceReached ? 'Free /BEFORE already used' : 'Generation hiccup', description: data.error ?? 'Try again in a moment.' });
        return;
      }
      // P&R accepted the job (or the built-in engine already finished).
      const running = data.status === 'running' || data.status === 'queued';
      setJob({
        id: data.jobId,
        status: data.status ?? 'running',
        provider: data.provider ?? null,
        toolName: data.tool ?? null,
        result: null,
        error: null,
        creditsNote: null,
      });
      if (running) pollJob(data.jobId);
      else {
        // Built-in fallback path completes synchronously; fetch the result.
        const full = await fetch(`/api/content/jobs/${data.jobId}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
        stopTimers();
        setBusy(false);
        if (full) {
          setJob({
            id: data.jobId,
            status: full.status,
            provider: full.provider,
            toolName: full.toolName,
            result: full.result,
            error: full.error,
            creditsNote: full.creditsNote,
          });
        }
      }
    } catch {
      setBusy(false);
      toast({ title: 'Network error', description: 'Could not reach the generator. Try again.' });
    }
  };

  const openPage = (url: string) => {
    track('pnr_click', auditId, { source: 'before-card', kind: 'before_preview' });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied' });
    } catch {
      toast({ title: 'Copy failed' });
    }
  };

  const working = busy || job?.status === 'running' || job?.status === 'queued';
  const isPnR = job?.provider === 'pnr-mcp';
  const isFallback = job?.provider === 'built-in-fallback';
  const r = job?.result ?? {};
  const copyBlock = [r.caption, r.postCopy].filter(Boolean).join('\n\n');

  // The MCP call, returned in a beveled iPhone.
  const threadMessages: PhoneThreadMessage[] = buildThreadMessages(r);
  const phoneImageUrl = isFallback
    ? `/api/content/image?jobId=${job?.id ?? ''}`
    : r.mediaUrls?.[0];
  const phoneHasContent = threadMessages.length > 0 || Boolean(phoneImageUrl);

  // Persist the real thread so the offers-page beveled iPhone replays it.
  // Deps are the whole job: the fallback flow sets status 'completed' twice
  // (first with result: null, then with the real result), so keying on
  // status alone would miss the second write.
  useEffect(() => {
    if (job?.status !== 'completed' || !job.result) return;
    const res = job.result;
    const img =
      job.provider === 'built-in-fallback'
        ? `/api/content/image?jobId=${job.id}`
        : res.mediaUrls?.[0];
    try {
      localStorage.setItem(
        BEFORE_STORE_KEY,
        JSON.stringify({
          thread: buildThreadMessages(res),
          imageUrl: img,
          caption: res.caption ?? '',
          postCopy: res.postCopy ?? '',
          provider: job.provider,
          toolName: job.toolName,
          at: Date.now(),
        })
      );
    } catch {
      /* storage unavailable - the report view still shows the phone */
    }
  }, [job]);

  return (
    <section
      aria-label="Your free before generation"
      className="mt-12 rounded-2xl border border-secondary/25 card-sheen bg-card/70 overflow-hidden print-hidden"
    >
      <div className="relative flex flex-col md:flex-row gap-6 p-6 sm:p-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-secondary uppercase">
            <Camera className="h-3.5 w-3.5" /> Complimentary · one per site
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            EVERY GLOW-UP NEEDS AN HONEST <span className="text-secondary">/BEFORE</span>.
          </h2>
          <p className="mt-2.5 text-sm text-muted-foreground max-w-xl leading-relaxed">
            We hand your website to the live Plunder &amp; Riffle <span className="font-semibold text-foreground">/before</span> engine:
            Joe records a custom welcome and builds <span className="font-semibold text-foreground">five real examples</span> - memes,
            an iMessage thread, the works - grounded in what your site actually says. On the house, because every
            transformation starts with the honest shot.
          </p>

          {!job && !working && (
            <div className="mt-5">
              <Button
                size="lg"
                onClick={generate}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black"
              >
                <Wand2 className="mr-1.5 h-4 w-4" /> GENERATE MY FREE /BEFORE
              </Button>
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Runs through the real P&amp;R MCP when an operator key is configured; otherwise the built-in AI engine
                steps in - clearly labeled, never faked. Takes up to a few minutes; you can keep reading the report.
              </p>
            </div>
          )}

          {working && (
            <div className="mt-5 rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3.5">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                {JOURNEY_LINES[journeyIdx]}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                The good formats take 1-3 minutes. Keep scrolling - we will keep this card updated.
              </p>
            </div>
          )}

          {job?.status === 'failed' && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3.5">
              <div className="text-sm font-bold text-red-400">The /BEFORE engine stumbled</div>
              <p className="mt-1 text-xs text-muted-foreground break-words">{job.error ?? 'Unknown error.'}</p>
              <Button size="sm" variant="outline" className="mt-2.5 border-border" onClick={generate}>
                <Wand2 className="h-3.5 w-3.5 mr-1" /> TRY AGAIN
              </Button>
            </div>
          )}

          {(job?.status === 'completed') && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn(isPnR ? 'border-primary/40 text-primary font-bold' : 'border-secondary/40 text-secondary')}>
                  {isPnR ? `via P&R MCP · ${job.toolName ?? 'create_before_pitch'}` : 'Built-in AI engine (P&R key not configured)'}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Check className="h-3 w-3 text-primary" /> Your free /BEFORE is ready
                </span>
              </div>

              {(r.mediaUrls?.length ?? 0) > 0 && (
                <div className="mt-3 flex gap-2.5 overflow-x-auto scroll-slim pb-1">
                  {r.mediaUrls!.slice(0, 6).map((u) => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg overflow-hidden border border-border/60 hover:border-primary/50 transition-colors">
                      <img src={u} alt="Generated before-pitch example" className="h-40 w-auto" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
              {isFallback && (
                <div className="mt-3">
                  <img
                    src={`/api/content/image?jobId=${job.id}`}
                    alt="Your before shot, generated by the built-in AI engine"
                    className="rounded-lg max-h-72 border border-border/60"
                    loading="lazy"
                  />
                </div>
              )}

              {copyBlock && (
                <div className="mt-3 rounded-lg border border-border/50 bg-background/50 p-3.5">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed max-h-48 overflow-y-auto scroll-slim">
                    {copyBlock}
                  </pre>
                  <Button size="sm" variant="outline" className="mt-2 border-border" onClick={() => copyText(copyBlock)}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> COPY
                  </Button>
                </div>
              )}

              <div className="mt-3.5 flex flex-wrap gap-2">
                {r.pageUrl && (
                  <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={() => openPage(r.pageUrl!)}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> OPEN YOUR /BEFORE PAGE
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-border" onClick={() => navigate('/offers')}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> NOW IMAGINE THE AFTER
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> P&amp;R previews are temporary pages - nothing is published or rendered without your approval.
              </p>
              {job.creditsNote && <p className="mt-1 text-[10px] text-muted-foreground">{job.creditsNote}</p>}
            </div>
          )}
        </div>

        {/* The MCP call, returned in a beveled iPhone */}
        <div className="shrink-0 flex flex-col items-center gap-3 md:pl-2">
          {working && (
            <PhoneThread
              title="Messages · Joe is typing..."
              tag="Live"
              messages={[]}
              typing
              typingLabel="the /before engine"
              footer="your honest before is developing..."
            />
          )}
          {job?.status === 'completed' && phoneHasContent && (
            <PhoneThread
              title={isPnR ? 'Messages · your /BEFORE thread (P&R MCP)' : 'Messages · your /BEFORE thread'}
              tag="Yours"
              messages={threadMessages}
              imageUrl={phoneImageUrl}
              imageAlt="Your generated before shot, returned inside the iPhone"
              footer="generated from your website"
            />
          )}
          {(!job || job.status === 'failed') && (
            <div className="hidden md:flex flex-col items-center gap-3" aria-hidden>
              <div className="relative w-[150px] rounded-[1.8rem] bg-gradient-to-b from-zinc-400 via-zinc-700 to-zinc-900 p-[2px] phone-bevel -rotate-[4deg] hover:rotate-0 transition-transform duration-500">
                <div className="rounded-[1.74rem] bg-zinc-950 p-[6px]">
                  <div className="relative rounded-[1.5rem] overflow-hidden bg-[#0b0f13] h-[240px] flex flex-col">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-10 rounded-full bg-black z-10" />
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-3 gap-1.5 pt-4">
                      <Camera className="h-5 w-5 text-secondary" />
                      <p className="text-[10px] font-black leading-tight text-zinc-100">
                        &ldquo;THE BEFORE. WE ALL HAVE ONE.&rdquo;
                      </p>
                      <p className="text-[7.5px] text-zinc-500">Custom examples from your real site</p>
                    </div>
                    <div className="bg-black/40 px-2 py-1 text-[7px] text-zinc-400 tracking-wider">/BEFORE ENGINE</div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-[200px] text-center leading-relaxed">
                Your generated thread lands here, in the iPhone.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
