'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'text-zinc-400';
  if (score >= 80) return 'text-primary';
  if (score >= 55) return 'text-secondary';
  return 'text-red-400';
}

function ringStroke(score: number): string {
  if (score >= 80) return 'var(--primary)';
  if (score >= 55) return 'var(--secondary)';
  return '#f87171';
}

export function ScoreRing({
  value,
  size = 100,
  stroke = 9,
  label,
  animated = false,
  className,
}: {
  value: number | null | undefined;
  size?: number;
  stroke?: number;
  label?: string;
  animated?: boolean;
  className?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const target = value ?? 0;

  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animated]);

  const display = animated ? (progress ?? 0) : target;

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, display)) / 100) * c;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringStroke(target)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={animated ? { strokeDashoffset: c } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-black font-mono leading-none', scoreColor(target))} style={{ fontSize: size * 0.3 }}>
          {display}
        </span>
        {label && <span className="text-[8px] uppercase tracking-widest text-zinc-500 mt-1">{label}</span>}
      </div>
    </div>
  );
}
