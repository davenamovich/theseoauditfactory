'use client';

// "Hand this to your agent" card. Builds a personalized, copy-ready prompt
// from the user's real audit results (see lib/seo/agent-prompt.ts) so they
// can dispatch their own AI agent on their site. Free, no signup, no faking:
// the prompt text is assembled from measured findings, scores and evidence.

import { useMemo, useState } from 'react';
import { Bot, Check, Copy, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { buildAgentPrompt } from '@/lib/seo/agent-prompt';
import type { AuditReport } from '@/lib/seo/types';

function track(kind: string, meta: Record<string, unknown>): void {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, meta }),
  }).catch(() => undefined);
}

export function AgentPromptCard({ report }: { report: AuditReport }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildAgentPrompt(report), [report]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      track('agent_prompt_copy', { host: report.host, overall: report.scores.overall });
      toast({ title: 'Prompt copied', description: 'Paste it into your AI agent and let it work.' });
      setTimeout(() => setCopied(false), 4000);
    } catch {
      toast({ title: 'Copy failed', description: 'Select the text and copy it manually.' });
    }
  };

  return (
    <section
      aria-label="Personalized prompt for your own AI agent"
      className="mt-12 rounded-2xl border border-primary/25 card-sheen bg-card/70 overflow-hidden print-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-primary uppercase">
              <Bot className="h-3.5 w-3.5" /> Free · built from your real results
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              HAND THIS PROMPT TO <span className="text-primary">YOUR OWN AGENT</span>.
            </h2>
            <p className="mt-2.5 text-sm text-muted-foreground max-w-xl leading-relaxed">
              Every fix, score and piece of evidence from your audit, written as ready-to-paste
              instructions for ChatGPT, Claude, Cursor or Agent 37. Your agent gets the exact
              measured to-do list - not a generic SEO checklist.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              size="lg"
              onClick={copy}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-black w-full sm:w-auto"
              aria-label="Copy the personalized agent prompt"
            >
              {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'COPIED' : 'COPY MY PROMPT'}
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border/60 bg-background/50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              agent-prompt.txt · {prompt.split('\n').length} lines · {report.host}
            </span>
            <span className="text-[10px] text-muted-foreground">0 words invented</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/90 leading-relaxed px-4 py-4 max-h-80 overflow-y-auto scroll-slim" aria-label="Personalized agent prompt text">
            {prompt}
          </pre>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" aria-hidden />
          Assembled only from what the crawler actually measured on {report.host} - the same data as
          this report. Your agent re-verifies everything against the live site before changing it.
        </p>
      </div>
    </section>
  );
}
