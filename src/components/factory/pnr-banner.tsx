'use client';

import { ExternalLink, Smartphone, Clapperboard, Laugh, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PnRBanner({ onTrack }: { onTrack?: () => void }) {
  const handleClick = () => {
    onTrack?.();
    window.open('https://www.plunderandriffle.com/whop', '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      aria-label="Plunder and Riffle promotion"
      className="print-hidden relative overflow-hidden rounded-2xl border border-secondary/25 card-sheen bg-card"
    >
      <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" aria-hidden />
      <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 sm:p-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-secondary uppercase">
            <Clapperboard className="h-3.5 w-3.5" /> Plunder &amp; Riffle
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            YOUR SEO IS ONLY HALF THE BATTLE.
            <br />
            <span className="text-secondary">NOW GET ATTENTION.</span>
          </h2>
          <p className="mt-2.5 text-sm text-muted-foreground max-w-xl">
            Turn your website, products and services into memes, videos, slideshows and social content.
            Create more content. Reach more people. Spend less.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={handleClick}>
              EXPLORE PLUNDER &amp; RIFFLE <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Laugh className="h-3 w-3" /> Memes</span>
            <span className="inline-flex items-center gap-1"><Clapperboard className="h-3 w-3" /> Videos</span>
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Slideshows</span>
            <span className="inline-flex items-center gap-1"><Smartphone className="h-3 w-3" /> Social packs</span>
          </p>
        </div>
        {/* Beveled mini phone with sample creative */}
        <div className="shrink-0 hidden sm:block" aria-hidden>
          <div className="relative w-[150px] rounded-[1.8rem] bg-gradient-to-b from-zinc-400 via-zinc-700 to-zinc-900 p-[2px] phone-bevel rotate-[4deg] hover:rotate-0 transition-transform duration-500">
            <div className="rounded-[1.74rem] bg-zinc-950 p-[6px]">
              <div className="relative rounded-[1.5rem] overflow-hidden bg-[#0b0f13] h-[240px] flex flex-col">
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-10 rounded-full bg-black z-10" />
                <div className="flex-1 flex flex-col items-center justify-center text-center px-3 gap-1.5 pt-4">
                  <Laugh className="h-5 w-5 text-secondary" />
                  <p className="text-[10px] font-black leading-tight text-zinc-100">
                    &ldquo;YOUR WEBSITE CALLED. IT WANTS ITS 2015 LOOK BACK.&rdquo;
                  </p>
                  <p className="text-[7.5px] text-zinc-500">Generated marketing creative</p>
                </div>
                <div className="bg-black/40 px-2 py-1 text-[7px] text-zinc-400 tracking-wider">PLUNDER &amp; RIFFLE ENGINE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
