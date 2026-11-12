'use client';

// Animated hero demo + sample phone screens (clearly labeled SAMPLE DATA).
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Search, TriangleAlert, Wrench, Megaphone, Bot, MapPin, Gauge, PiggyBank } from 'lucide-react';
import { PhoneScreenShell } from './phone-frame';
import { ScoreRing } from './score-ring';

const STAGES = [
  { label: 'Crawling homepage', icon: Search },
  { label: 'Checking robots.txt + sitemap', icon: Wrench },
  { label: 'AI search readiness', icon: Bot },
  { label: 'Local signals', icon: MapPin },
  { label: 'Performance (TTFB, assets)', icon: Gauge },
  { label: 'Building savings plan', icon: PiggyBank },
];

export function HeroDemoScreen() {
  const [stageIdx, setStageIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'stages' | 'score'>('typing');
  const url = 'sunset-plumbing.example';

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (typed.length < url.length) {
        t = setTimeout(() => setTyped(url.slice(0, typed.length + 1)), 55);
      } else {
        t = setTimeout(() => setPhase('stages'), 500);
      }
    } else if (phase === 'stages') {
      if (stageIdx < STAGES.length) {
        t = setTimeout(() => setStageIdx((i) => i + 1), 850);
      } else {
        t = setTimeout(() => setPhase('score'), 900);
      }
    } else {
      t = setTimeout(() => {
        setPhase('typing');
        setTyped('');
        setStageIdx(0);
      }, 8000);
    }
    return () => clearTimeout(t);
  }, [phase, typed, stageIdx]);

  return (
    <PhoneScreenShell title="Live audit demo">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center gap-2">
        <Search className="h-3 w-3 text-zinc-500" />
        <span className="text-[11px] font-mono text-zinc-200">
          {typed}
          {phase === 'typing' && <span className="inline-block w-1.5 h-3 bg-primary ml-0.5 align-middle pulse-dot" />}
        </span>
      </div>

      {phase !== 'score' && (
        <div className="mt-3 space-y-2">
          {STAGES.map((s, i) => {
            const done = i < stageIdx;
            const active = i === stageIdx && phase === 'stages';
            if (!done && !active && i > stageIdx) return null;
            return (
              <div key={s.label} className="enter-up flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
                {done ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 text-secondary animate-spin" />
                )}
                <span className="text-[10.5px] text-zinc-300">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {phase === 'score' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center pt-2">
          <ScoreRing value={71} size={116} label="Overall" animated />
          <div className="mt-3 w-full space-y-1.5">
            {[
              ['Technical', 78],
              ['Content', 66],
              ['AI Search', 58],
              ['Performance', 81],
            ].map(([label, v], i) => (
              <div key={label as string} className="enter-up" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
                  <span>{label}</span>
                  <span className="font-mono">{v}</span>
                </div>
                <div className="h-1 rounded bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v as number}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-secondary/30 bg-secondary/10 px-2.5 py-1.5 w-full">
            <p className="text-[9px] text-secondary leading-snug">5 money-saving opportunities found. Estimated potential: <span className="font-bold">$1.9k-$6.7k/yr</span> (illustrative)</p>
          </div>
        </motion.div>
      )}

      <div className="mt-auto pt-2 text-center text-[8px] text-zinc-600 font-mono">DEMO - SAMPLE DATA, NOT A REAL AUDIT</div>
    </PhoneScreenShell>
  );
}

export function AuditResultsScreen() {
  return (
    <PhoneScreenShell title="Audit report">
      <div className="flex items-center gap-3">
        <ScoreRing value={71} size={72} animated />
        <div>
          <div className="text-[10px] text-zinc-400">sunset-plumbing.example</div>
          <div className="text-[9px] text-zinc-500">Grade C - solid base, fixable issues</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          ['No sitemap found', 'High', 'text-red-400'],
          ['9 images missing alt text', 'Medium', 'text-amber-400'],
          ['No llms.txt for AI search', 'Low', 'text-amber-400'],
          ['Title tag too long (74 chars)', 'Medium', 'text-amber-400'],
          ['TTFB 640ms - caching helps', 'Medium', 'text-amber-400'],
        ].map(([t, sev, color], i) => (
          <div key={t} className="enter-up rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] text-zinc-200 truncate">{t}</span>
              <span className={`text-[8px] font-bold ${color} shrink-0`}>{sev}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1.5 text-[9px] text-primary">
        Every issue ships with evidence, a fix, and effort level.
      </div>
    </PhoneScreenShell>
  );
}

export function SavingsScreen() {
  const items = [
    ['Overlapping marketing tools', '$240-$1,440'],
    ['Slow-site hosting waste', '$240-$960'],
    ['Fix conversion before ads', '$300-$2,400'],
    ['Automate repetitive tasks', '$600-$3,600'],
    ['Free P&R content engine', '$600-$4,800'],
  ];
  return (
    <PhoneScreenShell title="Five ways to save">
      <div className="space-y-1.5">
        {items.map(([t, v], i) => (
          <div key={t} className="enter-up flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2" style={{ animationDelay: `${i * 110}ms` }}>
            <span className="h-4 w-4 shrink-0 rounded-full bg-secondary/20 text-secondary text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-[9.5px] text-zinc-200 leading-tight">{t}</span>
            <span className="ml-auto text-[9px] font-mono text-secondary shrink-0">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-2">
        <div className="text-[8px] text-primary/80 uppercase tracking-wider">Potential annual savings</div>
        <div className="text-[15px] font-black text-primary font-mono">$1,980 - $11,280</div>
        <div className="text-[8px] text-zinc-500 mt-0.5">Illustrative estimate - edit the assumptions</div>
      </div>
      <div className="mt-auto text-center text-[8px] text-zinc-600 font-mono">SAMPLE DATA</div>
    </PhoneScreenShell>
  );
}

export function AiVisibilityScreen() {
  const crawlers = [
    ['GPTBot (OpenAI)', 'allowed'],
    ['ClaudeBot', 'allowed'],
    ['PerplexityBot', 'allowed'],
    ['Google-Extended', 'BLOCKED'],
    ['CCBot', 'not set'],
  ];
  return (
    <PhoneScreenShell title="AI search readiness">
      <div className="flex items-center gap-3 mb-2.5">
        <ScoreRing value={58} size={64} animated />
        <p className="text-[9px] text-zinc-400 leading-snug">Readiness, not a guarantee: we measure whether AI systems <em>can</em> read and cite you.</p>
      </div>
      <div className="space-y-1">
        {crawlers.map(([name, policy], i) => (
          <div key={name} className="enter-up flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="text-[9.5px] text-zinc-200 font-mono">{name}</span>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
              policy === 'allowed' ? 'bg-primary/15 text-primary' : policy === 'BLOCKED' ? 'bg-red-500/15 text-red-400' : 'bg-zinc-500/15 text-zinc-400'
            }`}>
              {policy}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg border border-secondary/30 bg-secondary/10 px-2.5 py-1.5 text-[9px] text-secondary">
        Google-Extended is blocked: Gemini may not use your content for answers.
      </div>
      <div className="mt-auto text-center text-[8px] text-zinc-600 font-mono">SAMPLE DATA</div>
    </PhoneScreenShell>
  );
}

export function BeforeAfterScreen() {
  return (
    <PhoneScreenShell title="Fix what we find">
      <div className="grid grid-cols-2 gap-2 flex-1">
        <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-2">
          <div className="text-[8px] font-bold text-red-400 uppercase tracking-wider mb-1.5">Before</div>
          <div className="space-y-1">
            <div className="h-2 rounded bg-red-400/30 w-4/5" />
            <div className="h-2 rounded bg-red-400/20 w-3/5" />
            <div className="h-10 rounded bg-red-400/10 mt-1" />
            <div className="text-[8px] text-zinc-500 mt-1">TTFB 640ms - 2.1 MB page - no CTA above the fold</div>
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
          <div className="text-[8px] font-bold text-primary uppercase tracking-wider mb-1.5">After</div>
          <div className="space-y-1">
            <div className="h-2 rounded bg-primary/40 w-4/5" />
            <div className="h-2 rounded bg-primary/30 w-3/5" />
            <div className="h-10 rounded bg-primary/15 mt-1 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">GET A QUOTE</span>
            </div>
            <div className="text-[8px] text-zinc-500 mt-1">TTFB 190ms - lazy images - clear CTA</div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-2">
        <div className="text-[9px] text-zinc-300">Re-run anytime and compare progress over time.</div>
      </div>
      <div className="mt-auto text-center text-[8px] text-zinc-600 font-mono pt-1">SAMPLE DATA</div>
    </PhoneScreenShell>
  );
}

export function MemeScreen() {
  return (
    <PhoneScreenShell title="P&R content studio">
      <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-3 text-center gap-2">
          <TriangleAlert className="h-7 w-7 text-secondary" />
          <p className="text-[12px] font-black leading-tight text-zinc-100">
            &ldquo;YOUR WEBSITE CALLED.
            <br />
            IT WANTS ITS 2015 LOOK BACK.&rdquo;
          </p>
          <p className="text-[8.5px] text-zinc-400">Jobless Joe would like a word with your homepage.</p>
        </div>
        <div className="bg-black/40 px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[8px] font-bold text-zinc-300 tracking-wider">SUNSET PLUMBING CO</span>
          <span className="text-[7.5px] text-zinc-500">via P&R MCP</span>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="flex-1 rounded-md bg-primary/15 border border-primary/30 py-1 text-center text-[9px] font-bold text-primary">Approve</div>
        <div className="flex-1 rounded-md bg-white/5 border border-white/10 py-1 text-center text-[9px] text-zinc-400">Remix</div>
      </div>
      <div className="mt-auto text-center text-[8px] text-zinc-600 font-mono pt-1">MEMES, SLIDESHOWS, STICK-FIGURE VIDEOS</div>
    </PhoneScreenShell>
  );
}

export function SocialScreen() {
  return (
    <PhoneScreenShell title="Repurpose your site">
      <div className="space-y-1.5">
        {[
          ['Caption pack', '8 ready-to-post lines from your services page'],
          ['Carousel', '5 slides: "Why your pipes freeze in winter"'],
          ['Sticky video', 'Stick-figure skit: slow site vs lost customer'],
          ['Best-of reel', 'Your best photos, countdown format'],
        ].map(([t, d], i) => (
          <div key={t} className="enter-up rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="flex items-center gap-1.5">
              <Megaphone className="h-3 w-3 text-secondary" />
              <span className="text-[9.5px] font-bold text-zinc-200">{t}</span>
            </div>
            <div className="text-[8.5px] text-zinc-500 mt-0.5">{d}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg bg-secondary/10 border border-secondary/25 px-2.5 py-1.5 text-[9px] text-secondary">
        Built from YOUR pages - not generic filler.
      </div>
      <div className="mt-auto text-center text-[8px] text-zinc-600 font-mono">SAMPLE DATA</div>
    </PhoneScreenShell>
  );
}
