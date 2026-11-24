import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface UnboxingExperienceModalProps {
  isOpen: boolean;
  product: PerfumeProduct | null;
  onClose: () => void;
  onExpressOrder: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
}

export const UnboxingExperienceModal: React.FC<UnboxingExperienceModalProps> = ({
  isOpen,
  product,
  onClose,
  onExpressOrder,
  onAddToCart,
}) => {
  const [step, setStep] = useState<'sealed' | 'opened'>('sealed');
  const [selectedEngraving, setSelectedEngraving] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  if (!isOpen || !product) return null;

  const handleBreakSeal = () => {
    atelierAudio.playChime(660, 0.15);
    setTimeout(() => {
      atelierAudio.playChime(880, 0.12);
    }, 180);
    setStep('opened');
  };

  const handleReset = () => {
    setStep('sealed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="L'Art du Coffret - Atelier Unboxing Ritual"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-4xl bg-[#0E0D0C] text-[#FAF8F5] border border-[#2B2723] shadow-2xl relative overflow-hidden">
        {/* Subtle Luxury Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 w-96 h-96 bg-[#E4C79B]/10 rounded-full blur-[120px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#9A7B4F]/10 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#2B2723]">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#E4C79B] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>L&apos;Art du Coffret · The Unboxing Ritual</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl mt-0.5">
              {product.name} Presentation Box
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {step === 'opened' && (
              <button
                type="button"
                onClick={handleReset}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#8C847A] hover:text-white uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reseal Coffret</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 border border-[#2B2723] hover:border-[#E4C79B] text-[#8C847A] hover:text-white transition-colors cursor-pointer"
              aria-label="Close unboxing ritual"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unboxing Interactive Stage */}
        <div className="relative z-10 p-6 sm:p-10">
          {step === 'sealed' ? (
            /* STAGE 1: SEALED COFFRET WITH WAX SEAL */
            <div className="text-center py-8 sm:py-12 space-y-8 max-w-xl mx-auto">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#C8A97E]">
                  Handmade in Grasse · Certified Batch 2026
                </span>
                <h3 className="font-editorial text-3xl sm:text-4xl">
                  Part the Wax Seal to Open
                </h3>
                <p className="text-xs sm:text-sm text-[#A39C93] leading-relaxed">
                  Every Maison Léonie extrait arrives housed in a Belgian linen coffret, sealed by hand with molten crimson wax and certified by our master artisan.
                </p>
              </div>

              {/* The Interactive Wax Seal Button */}
              <div className="py-6 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleBreakSeal}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#E4C79B]"
                >
                  {/* Wax Seal Outer Organic Ripple */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isHovered
                        ? 'bg-gradient-to-br from-[#8B1E1E] to-[#540F0F] shadow-[0_0_35px_rgba(139,30,30,0.6)] ring-2 ring-[#E4C79B]/60'
                        : 'bg-gradient-to-br from-[#731919] to-[#450C0C] shadow-[0_8px_25px_rgba(0,0,0,0.8)]'
                    }`}
                  />
                  {/* Inner Stamped Crest */}
                  <div className="relative z-10 flex flex-col items-center justify-center border border-[#E4C79B]/40 rounded-full w-28 h-28 bg-[#5A1010]/80">
                    <span className="font-editorial text-2xl tracking-[0.2em] text-[#FAF8F5] uppercase">
                      ML
                    </span>
                    <span className="text-[7.5px] uppercase tracking-[0.28em] text-[#E4C79B] mt-0.5">
                      Paris · Grasse
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.14em] text-white/70 mt-1.5 group-hover:text-white transition-colors">
                      Click to Part Seal
                    </span>
                  </div>
                </button>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C847A] mt-4">
                  Touch the monogram seal to begin inspection
                </p>
              </div>

              {/* Privilege Guarantee Ribbon */}
              <div className="p-4 bg-[#141210] border border-[#2B2723] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A39C93]">
                <div className="flex items-center gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Includes matching 2ml tester vial on exterior for risk-free skin trial.</span>
                </div>
                <span className="text-[#E4C79B] text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">
                  100% Return Protection
                </span>
              </div>
            </div>
          ) : (
            /* STAGE 2: OPENED COFFRET REVEAL */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Visual Flacon & Velvet Bed Presentation */}
              <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/5] bg-gradient-to-b from-[#1C1815] to-[#0A0908] border border-[#2B2723] p-6 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#8C847A]">
                  <span>Atelier Lot #4 · Oak Aged</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Seal Parted</span>
                  </span>
                </div>

                {/* Crystal Flacon Resting on Crushed Velvet */}
                <div className="relative my-auto flex flex-col items-center justify-center">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#E4C79B]/15 blur-2xl rounded-full"
                  />
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="relative z-10 w-44 sm:w-56 h-auto object-cover drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]"
                  />

                  {/* Dynamic Engraving Gold Foil Script Preview */}
                  {selectedEngraving && (
                    <div className="relative z-20 -mt-14 px-3 py-1 bg-black/60 backdrop-blur-sm border border-[#E4C79B]/40 text-center">
                      <p className="font-editorial italic text-xs text-[#E4C79B] tracking-wider">
                        &ldquo;{selectedEngraving}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* The 2ml Exterior Matching Tester Vial Spotlight */}
                <div className="p-3 bg-black/60 border border-[#E4C79B]/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#E4C79B] block font-semibold">
                      Complimentary 2ml Extrait Vial
                    </span>
                    <span className="text-[11px] text-[#A39C93]">
                      Spray and test on skin for 5 days. Full flacon stays sealed.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Included Free
                  </span>
                </div>
              </div>

              {/* Right Column: Provenance Dossier & 1-Click Acquisition */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[#C8A97E] block mb-1">
                    Certificat d&apos;Atelier · Numbered Reserve
                  </span>
                  <h3 className="font-editorial text-3xl sm:text-4xl text-balance">
                    {product.name} Extrait de Parfum
                  </h3>
                  <p className="text-xs text-[#A39C93] mt-2 leading-relaxed">
                    Macerated in sessile French oak vessels at 32% pure aromatic oil concentration. Accompanied by our signed provenance certificate and gold leaf flacon engraving.
                  </p>
                </div>

                {/* Dossier Specifications Table */}
                <div className="space-y-2 border-y border-[#2B2723] py-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C847A] uppercase tracking-wider text-[10px]">Batch Number:</span>
                    <span className="font-mono text-[#E4C79B]">Flacon N° 048 / 250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C847A] uppercase tracking-wider text-[10px]">Terroir:</span>
                    <span>Domaine des Oliviers, Grasse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C847A] uppercase tracking-wider text-[10px]">Longevity:</span>
                    <span className="font-semibold text-white">{product.longevityHours} Hours on Skin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C847A] uppercase tracking-wider text-[10px]">Sample Guarantee:</span>
                    <span className="text-emerald-400 font-medium">30-Day Unconditional Return</span>
                  </div>
                </div>

                {/* Optional Engraving Preview Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="unboxing-engraving-input"
                    className="block text-[10px] uppercase tracking-[0.18em] text-[#C8A97E] font-medium"
                  >
                    Bespoke Gold Foil Bottle Engraving (Free)
                  </label>
                  <input
                    id="unboxing-engraving-input"
                    type="text"
                    maxLength={24}
                    value={selectedEngraving}
                    onChange={(e) => setSelectedEngraving(e.target.value)}
                    placeholder="e.g. For Elena · Always"
                    className="w-full bg-[#181614] border border-[#2B2723] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E4C79B]"
                  />
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-editorial text-3xl tabular-nums text-white">${product.price}</span>
                    <span className="text-[11px] uppercase tracking-wider text-[#C8A97E]">
                      Free Insured Courier Delivery
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onExpressOrder(product, product.volumeMl, product.price, selectedEngraving.trim() || undefined);
                        onClose();
                      }}
                      className="w-full py-3.5 px-4 bg-[#E4C79B] text-black text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white transition-colors cursor-pointer text-center shadow-lg"
                    >
                      Instant Acquisition
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product, product.volumeMl, product.price, selectedEngraving.trim() || undefined);
                        onClose();
                      }}
                      className="w-full py-3.5 px-4 border border-[#E4C79B] text-[#E4C79B] hover:bg-[#E4C79B] hover:text-black text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer text-center"
                    >
                      Add to Coffret Bag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
