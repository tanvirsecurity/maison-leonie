import React, { useState } from 'react';
import { ArrowRight, Compass, HeartHandshake, History, Sparkles } from 'lucide-react';
import { PROUSTIAN_PRESETS } from '../data/perfumes';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface MemoryVaultProps {
  products: PerfumeProduct[];
  onViewProduct: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct) => void;
}

interface PrescriptionResult {
  prompt: string;
  category: string;
  matchedProduct: PerfumeProduct;
  resonantNotes: string[];
  explanation: string;
  emotionalAnchor: string;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  products,
  onViewProduct,
  onAddToCart,
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [prescription, setPrescription] = useState<PrescriptionResult | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const synthesizeMemory = (text: string) => {
    const q = text.trim().toLowerCase();
    if (!q) return;

    setIsSynthesizing(true);
    atelierAudio.playChime(639, 0.12);

    setTimeout(() => {
      // Find matching preset or intelligently score products
      const preset = PROUSTIAN_PRESETS.find((p) =>
        p.prompt.toLowerCase().includes(q) || q.includes(p.prompt.toLowerCase().slice(0, 15))
      );

      let matchedProduct = products[0];
      let notes = ['Calabrian Bergamot', 'Grasse Jasmine', 'Warm Amber'];
      let explanation =
        'This memory lives at the crossroads of warmth and luminous discovery. The golden resins and delicate floral heart create a sanctuary where time stands still.';
      let category = 'Life Milestone';
      let emotionalAnchor = 'Safe Belonging · Sacred Nostalgia';

      if (preset) {
        matchedProduct = products.find((p) => p.id === preset.scentId) || products[0];
        notes = preset.resonantNotes;
        explanation = preset.whyItRelates;
        category = preset.category;
      } else if (
        q.includes('rain') ||
        q.includes('autumn') ||
        q.includes('smoke') ||
        q.includes('wood') ||
        q.includes('dark') ||
        q.includes('courage') ||
        q.includes('grief')
      ) {
        matchedProduct = products.find((p) => p.id === 'ember-noir') || products[1];
        notes = ['Assam Smoked Oud', 'Roasted Cardamom', 'Cistus Amber', 'Dark Vanilla'];
        explanation =
          'Rain and dark woods carry deep contemplative comfort. The charred oud and roasted cardamom wrap vulnerable memories in an invincible mantle of dignity.';
        category = 'Quiet Strength & Metamorphosis';
        emotionalAnchor = 'Resilience · Grounding Serenity';
      } else if (
        q.includes('mother') ||
        q.includes('linen') ||
        q.includes('heal') ||
        q.includes('peace') ||
        q.includes('gentle') ||
        q.includes('clean') ||
        q.includes('bed') ||
        q.includes('sunday')
      ) {
        matchedProduct = products.find((p) => p.id === 'lumiere-cherie') || products[2];
        notes = ['Florentine Iris Pallida', 'Pear Blossom', 'Ambrette Silk', 'Cashmere Musk'];
        explanation =
          'The tenderness of loved ones and sunlit clean mornings are immortalized in Florentine iris. It feels like an affectionate hand smoothing your brow.';
        category = 'Pure Sanctuary & Tenderness';
        emotionalAnchor = 'Innocence · Deep Comfort';
      } else if (
        q.includes('sea') ||
        q.includes('ocean') ||
        q.includes('sun') ||
        q.includes('summer') ||
        q.includes('laugh') ||
        q.includes('friend') ||
        q.includes('travel') ||
        q.includes('beach')
      ) {
        matchedProduct = products.find((p) => p.id === 'aurore-luminaire') || products[3];
        notes = ['Bitter Orange Neroli', 'Ripe Fig Nectar', 'Honeyed Tonka', 'Sea Breeze'];
        explanation =
          'Salt air, warmth on sun-kissed shoulders, and laughter that echoes across the water. Honeyed neroli blossom captures that eternal summertime of the spirit.';
        category = 'Radiant Joy & Wild Freedom';
        emotionalAnchor = 'Unbridled Vitality · Wonder';
      } else if (
        q.includes('love') ||
        q.includes('kiss') ||
        q.includes('date') ||
        q.includes('partner') ||
        q.includes('wedding') ||
        q.includes('rose') ||
        q.includes('passion')
      ) {
        matchedProduct = products.find((p) => p.id === 'nocturne-ambre') || products[4];
        notes = ['Damask Rose Absolute', 'Crimson Saffron', 'Velvet Amber', 'Pink Pepper'];
        explanation =
          'When you fell deeply in love, time seemed to halt. Damask rose and smoky amber capture that hypnotic pulse-point warmth of someone you hold close.';
        category = 'Sacred Love & Intimacy';
        emotionalAnchor = 'Heart Devotion · Magnetic Presence';
      } else if (
        q.includes('book') ||
        q.includes('study') ||
        q.includes('alone') ||
        q.includes('solitude') ||
        q.includes('quiet') ||
        q.includes('read')
      ) {
        matchedProduct = products.find((p) => p.id === 'sandalwood-amber') || products[5];
        notes = ['Mysore Sandalwood', 'Atlas Cedar', 'Sunlit Cardamom', 'Skin Musk'];
        explanation =
          'The rich satisfaction of solitude. Aged cedarwood and creamy sandalwood mirror the scent of paper, dry tea, and sacred introspective quiet.';
        category = 'Solitary Sanctuary';
        emotionalAnchor = 'Centered Wisdom · Inner Peace';
      } else {
        matchedProduct = products.find((p) => p.id === 'voie-dor') || products[0];
        notes = ['Calabrian Bergamot', 'Grasse Jasmine', 'Aged Sandalwood', 'Molten Amber'];
        explanation =
          'A watershed chapter of your life that deserves to be enshrined in gold. The radiant citrus lift and deep amber trail signify personal sovereignty.';
        category = 'Pinnacle Life Milestone';
        emotionalAnchor = 'Self-Actualization · Poise';
      }

      setPrescription({
        prompt: text,
        category,
        matchedProduct,
        resonantNotes: notes,
        explanation,
        emotionalAnchor,
      });
      setIsSynthesizing(false);
      atelierAudio.playChime(880, 0.15);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    synthesizeMemory(userPrompt);
  };

  return (
    <section
      id="memory-vault"
      className="py-24 lg:py-32 px-6 lg:px-10 bg-[#FAF8F5] dark:bg-[#12100E] border-t border-[#E5DFD5] dark:border-[#2B2723]"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
              Le Coffre aux Souvenirs · Proustian Memory Vault
            </p>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl text-balance mb-4 leading-[1.08]">
            What moment in your life do you{' '}
            <span className="italic font-normal text-[#9A7B4F] dark:text-[#C8A97E]">
              never want to forget?
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
            In 1913, Marcel Proust wrote how a single tea-soaked madeleine resurrected his entire lost
            childhood. Type any memory, person, or season from your life below. Our olfactive archive will
            prescribe the exact notes to anchor it forever on your skin.
          </p>
        </div>

        {/* Input Interface */}
        <div className="bg-[#FFFFFF] dark:bg-[#181513] border border-[#E5DFD5] dark:border-[#2B2723] p-6 sm:p-10 shadow-sm mb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="memory-input"
              className="block text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] font-medium"
            >
              Describe Your Memory, Feeling, or Life Chapter
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="memory-input"
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. Walking home at 2 AM in the rain with someone I loved..."
                  className="w-full bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-5 py-4 text-sm sm:text-base text-[#161412] dark:text-[#FAF8F5] placeholder-[#8C847A] focus:outline-none focus:border-[#9A7B4F] dark:focus:border-[#C8A97E] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSynthesizing || !userPrompt.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-xs uppercase tracking-[0.2em] hover:bg-[#9A7B4F] dark:hover:bg-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-50 shrink-0 font-medium"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{isSynthesizing ? 'Synthesizing...' : 'Prescribe Scent'}</span>
              </button>
            </div>
          </form>

          {/* Quick preset chips */}
          <div className="pt-6 border-t border-[#EAE3D8] dark:border-[#26221E] mt-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C847A] mb-3">
              Or Explore Life Memory Presets:
            </p>
            <div className="flex flex-wrap gap-2">
              {PROUSTIAN_PRESETS.map((preset) => (
                <button
                  key={preset.prompt}
                  type="button"
                  onClick={() => {
                    setUserPrompt(preset.prompt);
                    synthesizeMemory(preset.prompt);
                  }}
                  className="text-xs px-3.5 py-2 bg-[#F5EFE6] dark:bg-[#201D1A] hover:bg-[#EAE1D2] dark:hover:bg-[#2A2622] text-[#554E46] dark:text-[#D4CDC3] border border-[#E5DFD5] dark:border-[#2B2723] transition-colors text-left cursor-pointer"
                >
                  &ldquo;{preset.prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Synthesized Olfactive Prescription Card */}
        {prescription && (
          <div className="bg-[#FAF6F0] dark:bg-[#161412] border-2 border-[#C8A97E]/70 p-6 sm:p-10 lg:p-12 shadow-xl animate-fade-in transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5DFD5] dark:border-[#2B2723] mb-8">
              <div>
                <span className="text-[10px] tracking-[0.24em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] font-medium block mb-1">
                  Ordonnance Olfactive Privée · Prescribed by Maison Léonie
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#161412] dark:text-[#FAF8F5]">
                  Anchor for: &ldquo;{prescription.prompt}&rdquo;
                </h3>
              </div>
              <span className="px-4 py-1.5 text-xs bg-[#EFE8DD] dark:bg-[#24201C] border border-[#C8A97E]/40 text-[#9A7B4F] dark:text-[#E4C79B] tracking-[0.16em] uppercase">
                {prescription.category}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Product preview */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full max-w-[260px] aspect-[4/5] bg-gradient-to-b from-stone-200 to-stone-100 dark:from-[#211E1B] dark:to-[#12100E] border border-[#E5DFD5] dark:border-[#2B2723] overflow-hidden p-3 relative group">
                  <img
                    src={prescription.matchedProduct.images[0]}
                    alt={prescription.matchedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 inset-x-3 text-center text-white">
                    <p className="font-editorial text-xl">{prescription.matchedProduct.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#E4C79B]">
                      {prescription.matchedProduct.fragranceFamily} · ${prescription.matchedProduct.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Olfactive rationale & connection to life */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center gap-2 text-xs text-[#9A7B4F] dark:text-[#C8A97E] uppercase tracking-[0.18em]">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Emotional Chemistry: {prescription.emotionalAnchor}</span>
                </div>

                <p className="font-editorial text-xl sm:text-2xl italic text-[#4A443D] dark:text-[#EAE3D9] leading-relaxed">
                  &ldquo;{prescription.explanation}&rdquo;
                </p>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8C847A] mb-2">
                    Resonant Olfactive Chords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.resonantNotes.map((note) => (
                      <span
                        key={note}
                        className="px-3.5 py-1 text-xs bg-[#FFFFFF] dark:bg-[#1E1B18] border border-[#DCD5CB] dark:border-[#38322B] text-[#161412] dark:text-[#FAF8F5]"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onAddToCart(prescription.matchedProduct)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#9A7B4F] dark:hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <span>Bottle This Memory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewProduct(prescription.matchedProduct)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#C8A97E] text-xs uppercase tracking-[0.18em] text-[#161412] dark:text-[#FAF8F5] hover:bg-[#C8A97E]/10 transition-colors cursor-pointer"
                  >
                    <span>View Flacon Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
