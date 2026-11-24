import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HERO_SHUTTER_FRAMES } from '../data/perfumes';

interface HeroCinematicProps {
  onDiscoverScent: () => void;
  onExploreCollection: () => void;
  onExploreLifeChapters?: () => void;
  onExploreMemoryVault?: () => void;
  onQuickOrder?: () => void;
}

const LENT_INTERVAL_MS = 260;

export const HeroCinematic: React.FC<HeroCinematicProps> = ({
  onDiscoverScent,
  onExploreCollection,
  onExploreLifeChapters,
  onExploreMemoryVault,
  onQuickOrder,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [tickCount, setTickCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);

  // Discrete stepped stop-motion frame advance (rock-solid locked-off static background)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % HERO_SHUTTER_FRAMES.length);
      setTickCount((c) => c + 1);
    }, LENT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  // Stepped fragrance mist particles locked to stop-motion ticks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 1440;
    const height = canvas.clientHeight || 900;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const dropletCount = 40;
    for (let i = 0; i < dropletCount; i += 1) {
      const seed = (i * 137.5 + tickCount * 19.7) % 1000;
      const baseX = ((i * 73 + tickCount * (6 + (i % 5))) % (width + 80)) - 40;
      const waveY = Math.sin(seed * 0.04) * 24;
      const baseY = height * (0.18 + ((i * 29) % 64) / 100) + waveY - (tickCount % 12) * 3;
      const radius = 1 + (i % 4) * 0.85;
      const alpha = 0.07 + ((i + tickCount) % 5) * 0.04;

      const grad = ctx.createRadialGradient(baseX, baseY, 0, baseX, baseY, radius * 4);
      grad.addColorStop(0, `rgba(232, 204, 158, ${alpha})`);
      grad.addColorStop(1, 'rgba(232, 204, 158, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(baseX, baseY, radius * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [tickCount, activeFrameIndex]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full overflow-hidden bg-[#12100E] text-[#FAF8F5] flex flex-col justify-end"
    >
      {/* Locked-Off Tripod Stop-Motion Frame Reel (Static Background, Moving Subjects) */}
      <motion.div
        style={{ y: mediaY }}
        className="absolute inset-0 pointer-events-none select-none"
      >
        {HERO_SHUTTER_FRAMES.map((frame, index) => {
          const isCurrent = index === activeFrameIndex;
          return (
            <div
              key={frame.id}
              style={{
                opacity: isCurrent ? 1 : 0,
                transition: 'none',
              }}
              className="absolute inset-0"
            >
              <img
                src={frame.image}
                alt={frame.subcaption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
          );
        })}

        {/* Stepped stop-motion mist droplets canvas */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Measured contrast scrim preserving model & bottle brilliance on right */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B09]/85 via-black/25 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B09]/80 via-[#0D0B09]/35 to-transparent" />
      </motion.div>

      {/* Main Editorial Content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 max-w-[1360px] w-full mx-auto px-6 lg:px-10 pt-32 pb-10 lg:pb-14 flex flex-col justify-between gap-14"
      >
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-[1px] w-7 bg-[#D8B98E]" aria-hidden="true" />
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#E4C79B]">
              Haute Parfumerie · Paris &amp; Grasse
            </p>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.04] font-normal tracking-tight text-balance mb-6">
            Wear what you want to{' '}
            <span className="italic text-[#E4C79B] font-normal">remember.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#EAE3D9]/95 leading-relaxed max-w-lg mb-9">
            A bright breath before the day begins. A soft iris through the hours that are yours.
            Warm amber carried home after a night worth keeping. Composed in Grasse to become part
            of what you remember.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onQuickOrder || onExploreCollection}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase bg-[#FAF8F5] text-[#12100E] hover:bg-[#E4C79B] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold shadow-md"
            >
              <span>Order in 1 Look</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onExploreLifeChapters || onDiscoverScent}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase bg-[#E4C79B] text-[#12100E] hover:bg-[#FAF8F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
            >
              <span>Life Chapters</span>
            </button>
            <button
              type="button"
              onClick={onExploreMemoryVault || onDiscoverScent}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-[#E4C79B]/60 text-[#FAF8F5] hover:border-[#FAF8F5] hover:text-[#FAF8F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Memory Vault
            </button>
            <button
              type="button"
              onClick={onExploreCollection}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-[11px] tracking-[0.2em] uppercase text-[#E4C79B] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              All Flacons &rarr;
            </button>
          </div>
        </div>

        {/* Marcel Proust Olfactory Memory Principle */}
        <div className="max-w-md self-end text-right border-r border-[#E4C79B]/40 pr-4 hidden md:block">
          <p className="font-editorial text-sm italic text-[#EAE3D9]/80 leading-relaxed">
            &ldquo;When from a long-distant past nothing subsists, after the people are dead, the smell and taste of things remain poised a long time, ready to remind us.&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#E4C79B] mt-1.5">
            Marcel Proust · Du côté de chez Swann
          </p>
        </div>
      </motion.div>
    </section>
  );
};
