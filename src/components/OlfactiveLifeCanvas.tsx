import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Volume2 } from 'lucide-react';
import { LIFE_CHAPTERS, LifeChapter } from '../data/perfumes';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface OlfactiveLifeCanvasProps {
  products: PerfumeProduct[];
  onAddToCartWithEngraving: (product: PerfumeProduct, engraving?: string) => void;
  onViewProduct: (product: PerfumeProduct) => void;
}

export const OlfactiveLifeCanvas: React.FC<OlfactiveLifeCanvasProps> = ({
  products,
  onAddToCartWithEngraving,
  onViewProduct,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customEngraving, setCustomEngraving] = useState('');
  const [isEngravingApplied, setIsEngravingApplied] = useState(false);

  const activeChapter: LifeChapter = LIFE_CHAPTERS[selectedIdx] || LIFE_CHAPTERS[0];
  const associatedProduct = products.find((p) => p.id === activeChapter.associatedProductId) || products[0];

  const handleSelectChapter = (idx: number) => {
    setSelectedIdx(idx);
    setIsEngravingApplied(false);
    atelierAudio.playChime(528 + idx * 44, 0.1);
  };

  const handleApplyEngraving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEngraving.trim()) return;
    setIsEngravingApplied(true);
    atelierAudio.playChime(880, 0.15);
  };

  const handleAnchorMemory = () => {
    if (!associatedProduct) return;
    onAddToCartWithEngraving(associatedProduct, customEngraving.trim() || undefined);
    atelierAudio.playChime(660, 0.15);
  };

  return (
    <section
      id="life-canvas"
      className="relative py-28 lg:py-36 px-6 lg:px-10 bg-[#0E0D0C] text-[#FAF8F5] overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#9A7B4F]/10 blur-[140px] pointer-events-none rounded-full"
      />

      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-[#C8A97E]" aria-hidden="true" />
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#C8A97E]">
              L&apos;Écho de Votre Vie · Scent &amp; Human Existence
            </p>
            <span className="h-px w-8 bg-[#C8A97E]" aria-hidden="true" />
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-[4.2rem] leading-[1.04] font-normal tracking-tight text-balance mb-6">
            Your life is not measured in years.
            <span className="block italic text-[#E4C79B]">It is remembered in scent.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#D4CDC3] leading-relaxed max-w-2xl mx-auto">
            Olfactory memory is the only sense wired directly to the heart of the brain. A single breath
            can resurrect the morning you found your courage, the person whose embrace healed you, or the
            coast where you felt truly free.
          </p>
        </div>

        {/* Life Chapter Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-thin mb-12 border-b border-[#2B2723]">
          {LIFE_CHAPTERS.map((chap, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => handleSelectChapter(idx)}
                className={`group px-5 py-3.5 text-left transition-all duration-300 relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#FAF8F5]'
                    : 'text-[#8C847A] hover:text-[#D4CDC3]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] tracking-[0.2em] font-editorial ${isActive ? 'text-[#E4C79B]' : 'text-[#6B655E]'}`}>
                    Chapter {chap.numeral}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E4C79B] animate-pulse" />}
                </div>
                <p className="font-editorial text-base sm:text-lg tracking-normal">
                  {chap.title}
                </p>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E4C79B] to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage: Chapter Narrative & Engraving Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#151311] border border-[#2B2723] p-8 sm:p-12 lg:p-14 shadow-2xl relative">
          {/* Left Column: Life Story & Olfactive Architecture */}
          <div className="lg:col-span-7 space-y-7">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A39C93]">
              <span className="px-3 py-1 bg-[#221F1B] border border-[#3A342E] text-[#E4C79B] tracking-[0.16em] uppercase text-[10px]">
                {activeChapter.frequency}
              </span>
              <span className="text-[11px] tracking-[0.18em] uppercase">
                Aura: {activeChapter.resonantAura}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#C8A97E] mb-2">
                Chapter {activeChapter.numeral} · {activeChapter.subtitle}
              </p>
              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl leading-tight">
                {activeChapter.title}
              </h3>
            </div>

            <blockquote className="border-l-2 border-[#C8A97E] pl-5 italic font-editorial text-xl sm:text-2xl text-[#E8DFC8]/90 leading-snug">
              &ldquo;{activeChapter.quote}&rdquo;
            </blockquote>

            <p className="text-sm sm:text-base text-[#BFB7AA] leading-relaxed">
              {activeChapter.narrative}
            </p>

            {/* Note chords pill badges */}
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8C847A] mb-3">
                Key Olfactive Chords
              </p>
              <div className="flex flex-wrap gap-2">
                {activeChapter.keyNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3.5 py-1.5 text-xs bg-[#1C1916] border border-[#2B2723] text-[#FAF8F5] tracking-wide"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Live Engraving Input */}
            <div className="pt-4 border-t border-[#26221E]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E4C79B]" aria-hidden="true" />
                <label
                  htmlFor="bottle-engraving"
                  className="text-xs uppercase tracking-[0.2em] text-[#E4C79B] font-medium"
                >
                  Bespoke Flacon Engraving Studio (Complimentary)
                </label>
              </div>
              <p className="text-xs text-[#8C847A] mb-3">
                Engrave a cherished life milestone, loved one&apos;s name, or date onto the crystal bottle in pure gold leaf script.
              </p>
              <form onSubmit={handleApplyEngraving} className="flex gap-2">
                <input
                  id="bottle-engraving"
                  type="text"
                  maxLength={28}
                  value={customEngraving}
                  onChange={(e) => {
                    setCustomEngraving(e.target.value);
                    setIsEngravingApplied(false);
                  }}
                  placeholder="e.g. Elena · Paris 2024 or Begin Again"
                  className="flex-1 bg-[#1A1715] border border-[#3A342E] px-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#6B655E] focus:outline-none focus:border-[#C8A97E] transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2B2723] hover:bg-[#C8A97E] hover:text-[#0E0D0C] text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer"
                >
                  Preview
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleAnchorMemory}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#E4C79B] hover:bg-[#FAF8F5] text-[#0E0D0C] text-[11px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 shadow-lg cursor-pointer"
              >
                <span>Anchor This Life Chapter</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              {associatedProduct && (
                <button
                  type="button"
                  onClick={() => onViewProduct(associatedProduct)}
                  className="inline-flex items-center gap-2 px-6 py-4 border border-[#3A342E] hover:border-[#C8A97E] text-xs uppercase tracking-[0.18em] text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span>Explore {associatedProduct.name}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Flacon Display with Real-Time Foil Engraving Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] bg-gradient-to-b from-[#1E1B18] to-[#12100E] border border-[#2B2723] p-6 flex flex-col items-center justify-center overflow-hidden group">
              {/* Bottle Image */}
              <img
                src={activeChapter.image}
                alt={activeChapter.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Shimmer overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"
              />

              {/* Floating Monogram / Custom Engraving Display on Bottle Glass */}
              <div className="absolute inset-x-8 bottom-12 p-4 bg-black/60 backdrop-blur-md border border-[#E4C79B]/40 text-center transition-all duration-300">
                <p className="text-[10px] tracking-[0.24em] uppercase text-[#E4C79B] mb-1">
                  Atelier Grasse · Inscription
                </p>
                <div className="font-editorial text-xl sm:text-2xl text-[#FAF8F5] tracking-widest min-h-[32px] flex items-center justify-center">
                  {customEngraving.trim() ? (
                    <span className="italic font-normal text-[#E4C79B] drop-shadow-[0_0_8px_rgba(228,199,155,0.6)]">
                      &ldquo;{customEngraving}&rdquo;
                    </span>
                  ) : (
                    <span className="text-xs text-[#8C847A] tracking-wider uppercase">
                      [ Your Life Milestone Here ]
                    </span>
                  )}
                </div>
                {isEngravingApplied && (
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#73BA82] mt-1 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Gold leaf engraving verified
                  </p>
                )}
              </div>

              {/* Top metadata badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/70">
                <span>Maison Léonie</span>
                <span>Vol. {associatedProduct?.volumeMl || 100} ML</span>
              </div>
            </div>

            <p className="mt-4 font-editorial text-sm italic text-[#8C847A] text-center max-w-xs">
              {activeChapter.lifeAnchorPrompt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
