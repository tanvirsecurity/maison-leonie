import React, { useState } from 'react';
import { ArrowRight, Clock, Layers, Sparkles } from 'lucide-react';
import { DAILY_RITUALS, DailyRitual } from '../data/perfumes';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface ScentRitualLayeringProps {
  products: PerfumeProduct[];
  onViewProduct: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct) => void;
}

export const ScentRitualLayering: React.FC<ScentRitualLayeringProps> = ({
  products,
  onViewProduct,
  onAddToCart,
}) => {
  const [selectedRitualIdx, setSelectedRitualIdx] = useState(0);
  const [layerBaseId, setLayerBaseId] = useState('voie-dor');
  const [layerTopId, setLayerTopId] = useState('lumiere-cherie');

  const activeRitual: DailyRitual = DAILY_RITUALS[selectedRitualIdx] || DAILY_RITUALS[0];
  const ritualProduct = products.find((p) => p.id === activeRitual.scentId) || products[0];

  const baseProduct = products.find((p) => p.id === layerBaseId) || products[0];
  const topProduct = products.find((p) => p.id === layerTopId) || products[1];

  const handleSelectRitual = (idx: number) => {
    setSelectedRitualIdx(idx);
    atelierAudio.playChime(528 + idx * 50, 0.1);
  };

  return (
    <section
      id="rituals-layering"
      className="py-24 lg:py-32 px-6 lg:px-10 bg-[#F5EFE6] dark:bg-[#100E0C] text-[#161412] dark:text-[#FAF8F5] transition-colors"
    >
      <div className="max-w-[1360px] mx-auto space-y-20">
        {/* Part 1: The 24-Hour Life Ritual */}
        <div>
          <div className="max-w-2xl mb-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                Le Rituel Quotidien · Scent Across Your 24 Hours
              </p>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.08] mb-4">
              A fragrance for every rhythm of{' '}
              <span className="italic font-normal text-[#9A7B4F] dark:text-[#C8A97E]">
                your day.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              We do not live in a single emotional state. As the sunlight shifts from morning clarity
              to midday focus and evening intimacy, allow your fragrance to hold space for your spirit.
            </p>
          </div>

          {/* Time Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {DAILY_RITUALS.map((ritual, idx) => {
              const isActive = idx === selectedRitualIdx;
              return (
                <button
                  key={ritual.time}
                  type="button"
                  onClick={() => handleSelectRitual(idx)}
                  className={`p-6 text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#9A7B4F] dark:border-[#C8A97E] bg-[#FFFFFF] dark:bg-[#1A1714] shadow-md'
                      : 'border-[#E5DFD5] dark:border-[#26221E] bg-[#FAF8F5]/60 dark:bg-[#13110F] hover:border-[#9A7B4F]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-editorial text-2xl text-[#9A7B4F] dark:text-[#C8A97E]">
                      {ritual.time}
                    </span>
                    <Clock className="w-3.5 h-3.5 text-[#8C847A]" />
                  </div>
                  <p className="font-editorial text-lg mb-1 leading-snug">{ritual.phase}</p>
                  <p className="text-xs text-[#8C847A] line-clamp-2">{ritual.lifeContext}</p>
                </button>
              );
            })}
          </div>

          {/* Active Ritual Spotlight */}
          <div className="border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#161412] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E]">
                <span>{activeRitual.time} Ritual</span>
                <span>·</span>
                <span>{activeRitual.phase}</span>
              </div>
              <h3 className="font-editorial text-3xl sm:text-4xl text-[#161412] dark:text-[#FAF8F5]">
                {activeRitual.lifeContext}
              </h3>
              <p className="font-editorial text-xl italic text-[#6B655E] dark:text-[#D4CDC3]">
                &ldquo;{activeRitual.quote}&rdquo;
              </p>
              <div className="p-4 bg-[#FAF8F5] dark:bg-[#1E1B18] border-l-2 border-[#9A7B4F] dark:border-[#C8A97E]">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9A7B4F] dark:text-[#C8A97E] font-medium mb-1">
                  Atelier Application Guide
                </p>
                <p className="text-sm text-[#554E46] dark:text-[#BFB7AA]">
                  {activeRitual.ritualAction}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => onAddToCart(ritualProduct)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#9A7B4F] dark:hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span>Acquire {ritualProduct.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewProduct(ritualProduct)}
                  className="px-6 py-3.5 border border-[#E5DFD5] dark:border-[#2B2723] text-xs uppercase tracking-[0.18em] hover:border-[#9A7B4F] transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 h-64 bg-stone-100 dark:bg-[#1A1714] border border-[#E5DFD5] dark:border-[#2B2723] p-3 overflow-hidden shadow-md">
                <img
                  src={ritualProduct.images[0]}
                  alt={ritualProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Dual Scent Layering Alchemist */}
        <div className="border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#141210] p-8 sm:p-12 lg:p-14 shadow-lg">
          <div className="max-w-2xl mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#9A7B4F] dark:text-[#C8A97E]" />
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                L&apos;Alchimie des Accords · Bespoke Scent Layering
              </p>
            </div>
            <h3 className="font-editorial text-3xl sm:text-4xl">
              Create a signature scent unique to{' '}
              <span className="italic font-normal text-[#9A7B4F] dark:text-[#C8A97E]">
                your skin.
              </span>
            </h3>
            <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mt-2">
              In Grasse haute parfumerie, layering two complementary extraits creates a third,
              wholly bespoke fragrance aura that no one else in the world possesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Flacon A */}
            <div className="border border-[#E5DFD5] dark:border-[#2B2723] p-6 bg-[#FFFFFF] dark:bg-[#181513]">
              <label
                htmlFor="base-perfume-select"
                className="block text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] mb-3 font-medium"
              >
                1. Anchor Flacon (Base &amp; Resonance)
              </label>
              <select
                id="base-perfume-select"
                value={layerBaseId}
                onChange={(e) => {
                  setLayerBaseId(e.target.value);
                  atelierAudio.playChime(440, 0.1);
                }}
                className="w-full bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-4 py-3 text-sm text-[#161412] dark:text-[#FAF8F5] focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.fragranceFamily} (${p.price})
                  </option>
                ))}
              </select>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={baseProduct.images[0]}
                  alt={baseProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover border border-[#E5DFD5] dark:border-[#2B2723]"
                />
                <div>
                  <p className="font-editorial text-lg">{baseProduct.name}</p>
                  <p className="text-xs text-[#8C847A]">
                    Base: {baseProduct.baseNotes.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Flacon B */}
            <div className="border border-[#E5DFD5] dark:border-[#2B2723] p-6 bg-[#FFFFFF] dark:bg-[#181513]">
              <label
                htmlFor="veil-perfume-select"
                className="block text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] mb-3 font-medium"
              >
                2. Luminous Veil (Top &amp; Heart Lift)
              </label>
              <select
                id="veil-perfume-select"
                value={layerTopId}
                onChange={(e) => {
                  setLayerTopId(e.target.value);
                  atelierAudio.playChime(660, 0.1);
                }}
                className="w-full bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-4 py-3 text-sm text-[#161412] dark:text-[#FAF8F5] focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.fragranceFamily} (${p.price})
                  </option>
                ))}
              </select>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={topProduct.images[0]}
                  alt={topProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover border border-[#E5DFD5] dark:border-[#2B2723]"
                />
                <div>
                  <p className="font-editorial text-lg">{topProduct.name}</p>
                  <p className="text-xs text-[#8C847A]">
                    Top: {topProduct.topNotes.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Layering Alchemy Result */}
          <div className="bg-[#EFE8DD] dark:bg-[#1C1916] border border-[#C8A97E]/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7B4F] dark:text-[#E4C79B]" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B] font-semibold">
                  Synthesized Duo: {baseProduct.name} + {topProduct.name}
                </span>
              </div>
              <p className="font-editorial text-xl italic text-[#161412] dark:text-[#FAF8F5]">
                Aura: Deep {baseProduct.fragranceFamily.toLowerCase()} warmth crowned with fresh{' '}
                {topProduct.fragranceFamily.toLowerCase()} radiance.
              </p>
              <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                Spray {baseProduct.name} first at pulse points; wait 30 seconds, then mist {topProduct.name} across your hair and shoulders.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(baseProduct);
                  onAddToCart(topProduct);
                  atelierAudio.playChime(770, 0.15);
                }}
                className="px-6 py-3.5 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#9A7B4F] dark:hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Acquire Both Flacons
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
