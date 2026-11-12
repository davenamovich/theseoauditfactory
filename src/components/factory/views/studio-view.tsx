'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Camera, Clapperboard, Copy, Download, ExternalLink, Flame, GalleryHorizontal, Image as ImageIcon,
  Laugh, Loader2, Mic, PenTool, RefreshCw, Sparkles, Type, Video, Check, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface JobResult {
  pageUrl?: string;
  mediaUrls?: string[];
  postCopy?: string;
  caption?: string;
  headline?: string;
  base64?: string;
  mime?: string;
  text?: string;
  kind?: string;
  jobId?: string;
  jobKind?: string;
  mp4Url?: string;
  mp4Status?: string;
  mp4JobId?: string;
}

interface Job {
  id: string;
  assetType: string;
  topic?: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  provider?: string | null;
  toolName?: string | null;
  result?: JobResult | null;
  error?: string | null;
  creditsNote?: string | null;
  createdAt?: string;
}

const ASSET_META: Record<string, { label: string; blurb: string; icon: typeof Laugh; main: boolean }> = {
  meme: { label: 'Business Meme', blurb: 'A shareable meme from your audit insights', icon: Laugh, main: true },
  'promo-meme': { label: 'Promo Hot-Take', blurb: 'A hot-take meme selling your main offer', icon: Flame, main: true },
  'social-graphic': { label: 'Social Graphics', blurb: 'Square, feed and story PNGs with post copy', icon: ImageIcon, main: true },
  'before-pitch': { label: 'Free /BEFORE', blurb: "Joe's welcome + five custom examples from your site", icon: Camera, main: false },
  carousel: { label: 'Carousel / Slideshow', blurb: 'A multi-slide promotional slideshow', icon: GalleryHorizontal, main: true },
  'stick-figure-video': { label: 'Stick-Figure Video', blurb: 'A stick-figure marketing video from your site', icon: PenTool, main: false },
  'video-show': { label: 'Marketing Video', blurb: 'A short voiced marketing presentation', icon: Video, main: false },
  'captions-pack': { label: 'Captions Pack', blurb: 'Ready-to-post captions and promo copy', icon: Type, main: false },
  'repurpose-pack': { label: 'Site-to-Social Repurpose', blurb: 'Your brand voice, researched, then a creative', icon: RefreshCw, main: false },
  'site-roast': { label: 'Jobless Joe Roast', blurb: 'A 30-second comedy episode roasting your site', icon: Mic, main: false },
};

const ALL_TYPES = Object.keys(ASSET_META);

export function ContentStudio({ auditId, compact = false }: { auditId: string; compact?: boolean }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<string>('meme');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [polling, setPolling] = useState<string | null>(null);
  const { toast } = useToast();

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/content/jobs?auditId=${encodeURIComponent(auditId)}`, { cache: 'no-store' });
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch {
      /* ignore */
    }
  }, [auditId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Poll running jobs
  useEffect(() => {
    const running = jobs.find((j) => j.status === 'running');
    if (!running) return;
    setPolling(running.id);
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/content/jobs/${running.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.status !== 'running') {
          clearInterval(timer);
          setPolling(null);
          await loadJobs();
        }
      } catch {
        /* keep polling */
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [jobs, loadJobs]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, assetType: selected, topic: topic || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.allowanceReached) {
          toast({
            title: 'Free samples used up',
            description: 'Head to Plunder & Riffle for unlimited content creation.',
          });
        } else {
          toast({ title: 'Generation failed', description: data.error ?? 'Something went wrong.' });
        }
      }
      await loadJobs();
    } catch {
      toast({ title: 'Network error', description: 'Could not reach the generator.' });
    } finally {
      setGenerating(false);
    }
  };

  const types = compact ? ALL_TYPES.filter((t) => ASSET_META[t].main) : ALL_TYPES;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {types.map((t) => {
          const meta = ASSET_META[t];
          const Icon = meta.icon;
          return (
            <button
              key={t}
              onClick={() => setSelected(t)}
              aria-pressed={selected === t}
              className={cn(
                'text-left rounded-xl border p-3.5 transition-colors',
                selected === t ? 'border-primary/60 bg-primary/10' : 'border-border/60 bg-background/40 hover:border-primary/35'
              )}
            >
              <Icon className={cn('h-4.5 w-4.5 h-5 w-5', selected === t ? 'text-primary' : 'text-muted-foreground')} />
              <div className="mt-1.5 text-sm font-bold leading-tight">{meta.label}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{meta.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="Optional focus (e.g. emergency repairs, weekend sale)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-background/60"
          aria-label="Optional content focus"
        />
        <Button
          onClick={generate}
          disabled={generating || Boolean(polling)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-black shrink-0"
        >
          {generating || polling ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Wand2 className="h-4 w-4 mr-1.5" />}
          {generating ? 'GENERATING...' : polling ? 'P&R IS COOKING...' : 'GENERATE FREE SAMPLE'}
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Generation runs through the live Plunder &amp; Riffle MCP (real tool calls, previews before anything is
        published). Video formats take 1-3 minutes. Your free sample allowance is set by the operator.
      </p>

      {/* Results */}
      <div className="mt-5 space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onRefresh={loadJobs} />
        ))}
        {jobs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border/60 rounded-xl">
            No content generated yet. Pick a format above and create your first free sample.
          </p>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const meta = ASSET_META[job.assetType];
  const { toast } = useToast();
  const [mp4State, setMp4State] = useState<'idle' | 'rendering' | 'done' | 'failed'>(job.result?.mp4Url ? 'done' : 'idle');
  const [mp4Url, setMp4Url] = useState<string | null>(job.result?.mp4Url ?? null);

  const r = job.result ?? {};
  const provider = job.provider;

  // MP4 render polling
  useEffect(() => {
    if (mp4State !== 'rendering') return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/content/mp4?contentJobId=${job.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.status === 'done') {
          setMp4State('done');
          setMp4Url(data.mp4Url);
          clearInterval(timer);
          onRefresh();
        } else if (data.status === 'failed') {
          setMp4State('failed');
          clearInterval(timer);
        }
      } catch {
        /* keep polling */
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [mp4State, job.id, onRefresh]);

  const approveMp4 = async () => {
    setMp4State('rendering');
    try {
      const res = await fetch('/api/content/mp4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentJobId: job.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMp4State('failed');
        toast({ title: 'Render failed', description: data.error ?? 'request_mp4 failed' });
      } else {
        toast({ title: 'Rendering MP4', description: 'P&R renders in 1-3 minutes. This approval covers the render.' });
      }
    } catch {
      setMp4State('failed');
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied' });
    } catch {
      toast({ title: 'Copy failed' });
    }
  };

  if (job.status === 'running') {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <div className="font-bold text-sm">{meta?.label ?? job.assetType} in progress</div>
            <div className="text-xs text-muted-foreground">Calling the P&R MCP and polling job status. Video formats take 1-3 minutes.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (job.status === 'failed') {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 font-bold text-sm text-red-400">
            {meta?.label ?? job.assetType} failed
          </div>
          <p className="mt-1 text-xs text-muted-foreground break-words">{job.error}</p>
        </CardContent>
      </Card>
    );
  }

  const isPnR = provider === 'pnr-mcp';
  const isFallback = provider === 'built-in-fallback';

  return (
    <Card className={cn('border-border/60 bg-card/70', isPnR && 'border-primary/35')}>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-sm">{meta?.label ?? job.assetType}</span>
          <Badge variant="outline" className={isPnR ? 'border-primary/40 text-primary font-bold' : 'border-secondary/40 text-secondary'}>
            {isPnR ? `via P&R MCP · ${job.toolName ?? 'tool'}` : isFallback ? 'Built-in AI engine (P&R key not configured)' : ''}
          </Badge>
          {job.creditsNote && <span className="text-[10px] text-muted-foreground ml-auto max-w-full sm:max-w-[50%]">{job.creditsNote}</span>}
        </div>

        {/* Media */}
        {(r.mediaUrls?.length ?? 0) > 0 && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto scroll-slim pb-1">
            {r.mediaUrls!.slice(0, 6).map((u) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg overflow-hidden border border-border/60 hover:border-primary/50 transition-colors">
                <img src={u} alt="Generated marketing creative" className="h-40 w-auto" loading="lazy" />
              </a>
            ))}
          </div>
        )}
        {isFallback && r.base64 && (
          <div className="mt-3">
            <img
              src={`/api/content/image?jobId=${job.id}`}
              alt="Generated marketing graphic"
              className="rounded-lg max-h-72 border border-border/60"
              loading="lazy"
            />
          </div>
        )}
        {mp4Url && (
          <video src={mp4Url} controls className="mt-3 rounded-lg max-h-80 border border-border/60" />
        )}
        {mp4State === 'rendering' && (
          <div className="mt-3 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm text-secondary flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Rendering MP4 on P&R (1-3 minutes)...
          </div>
        )}

        {/* Copy */}
        {(r.postCopy || r.caption || r.text) && (
          <div className="mt-3 rounded-lg border border-border/50 bg-background/50 p-3.5">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed max-h-48 overflow-y-auto scroll-slim">
              {r.text ?? [r.headline, r.caption, r.postCopy].filter(Boolean).join('\n\n')}
            </pre>
            <Button size="sm" variant="outline" className="mt-2 border-border" onClick={() => copyText(r.text ?? [r.headline, r.caption, r.postCopy].filter(Boolean).join('\n\n'))}>
              <Copy className="h-3.5 w-3.5 mr-1" /> COPY
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          {r.pageUrl && (
            <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => window.open(r.pageUrl, '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> OPEN P&R PREVIEW
            </Button>
          )}
          {r.pageUrl && isPnR && mp4State === 'idle' && (
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={approveMp4}>
              <Clapperboard className="h-3.5 w-3.5 mr-1" /> APPROVE &amp; RENDER MP4
            </Button>
          )}
          {(r.mediaUrls?.length ?? 0) > 0 && (
            <Button size="sm" variant="outline" className="border-border" onClick={() => window.open(r.mediaUrls![0], '_blank', 'noopener,noreferrer')}>
              <Download className="h-3.5 w-3.5 mr-1" /> DOWNLOAD
            </Button>
          )}
          {isFallback && (
            <Button size="sm" variant="outline" className="border-border" onClick={() => window.open('https://www.plunderandriffle.com/whop', '_blank', 'noopener,noreferrer')}>
              <Sparkles className="h-3.5 w-3.5 mr-1" /> GET FULL P&R ENGINE
            </Button>
          )}
        </div>
        {r.pageUrl && (
          <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-primary" /> P&amp;R shows a preview page first - nothing is published or rendered without your approval, exactly as their API requires.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
