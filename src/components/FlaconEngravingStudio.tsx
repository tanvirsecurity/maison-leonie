import React, { useRef, useState } from 'react';
import {
  Check,
  Compass,
  Copy,
  PenTool,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface FlaconEngravingStudioProps {
  products: PerfumeProduct[];
  onExpressOrder: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
}

const BOTTLE_PORTRAITS: Record<string, string> = {
  'voie-dor': '/src/assets/images/bottle_santal_imperial_1795464160135.jpg',
  'ember-noir': '/src/assets/images/bottle_oud_velours_1795464159199.jpg',
  'lumiere-cherie': '/src/assets/images/bottle_iris_blanc_1795464159068.jpg',
  'aurore-luminaire': '/src/assets/images/bottle_neroli_soleil_1795464160313.jpg',
  'nocturne-ambre': '/src/assets/images/bottle_rose_nuit_1795464160072.jpg',
  'sandalwood-amber': '/src/assets/images/bottle_santal_imperial_1795464160135.jpg',
  'leclat-celeste': '/src/assets/images/bottle_bergamote_celeste_1795464161390.jpg',
  'coffret-decouverte': '/src/assets/images/bottle_iris_blanc_1795464159068.jpg',
};

export const FlaconEngravingStudio: React.FC<FlaconEngravingStudioProps> = ({
  products,
  onExpressOrder,
  onAddToCart,
}) => {
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [engravingText, setEngravingText] = useState('Pour Elena · Oct 14');
  const [fontStyle, setFontStyle] = useState<'cursive' | 'serif'>('cursive');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const activeProduct = products[selectedProductIdx] || products[0];
  const containerRef = useRef<HTMLDivElement>(null);

  const flaconImg =
    BOTTLE_PORTRAITS[activeProduct.id] ||
    activeProduct.images.find((img) => img.includes('bottle_')) ||
    activeProduct.images[0];

  const presets = [
    { label: 'Anniversary', text: 'Pour Elena · Oct 14' },
    { label: 'Rebirth', text: 'Begin Again' },
    { label: 'Courage', text: 'Quiet Sovereignty' },
    { label: 'Devotion', text: 'Forever in Grasse' },
    { label: 'Sanctuary', text: 'Autumn Sanctuary' },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleSelectPreset = (text: string) => {
    setEngravingText(text);
    atelierAudio.playChime(740, 0.1);
  };

  return (
    <section className="py-24 px-6 lg:px-10 bg-[#0E0D0C] text-[#FAF8F5] border-b border-[#2B2723] relative overflow-hidden">
      {/* Background ambient gold lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#E4C79B]/10 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1815] border border-[#E4C79B]/40 text-[#E4C79B] text-[10px] tracking-[0.24em] uppercase font-medium">
            <PenTool className="w-3.5 h-3.5" />
            <span>Atelier de Gravure · Complimentary Custom Craft</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance">
            Your name, embossed in{' '}
            <span className="italic text-[#E4C79B]">24-karat gold leaf.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#A39C93] max-w-xl mx-auto leading-relaxed">
            Move your cursor across the crystal flacon to see the gold foil reflect the ambient light. Hand-inscribed in our Paris laboratory for a gift destined to outlive memory.
          </p>
        </div>

        {/* Studio Interactive Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Interactive 3D Crystal Flacon Plinth */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="lg:col-span-6 relative aspect-[3/4] bg-gradient-to-b from-[#181512] via-[#120F0D] to-[#0A0908] border border-[#2B2723] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl group transition-all duration-300"
            style={{
              perspective: '1200px',
            }}
          >
            {/* Top Status Bar on Plinth */}
            <div className="relative z-20 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#8C847A] pb-3 border-b border-white/5">
              <span>Maison Léonie · Flacon N° 048 / 250</span>
              <span className="text-[#E4C79B] flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-[#E4C79B]" />
                <span>24k Gold Foil Leaf</span>
              </span>
            </div>

            {/* The Majestic Flacon Canvas with 3D Tilt & Specular Sheen */}
            <div
              className="relative z-10 my-auto flex flex-col items-center justify-center transition-transform duration-150 ease-out"
              style={{
                transform: `rotateY(${(mousePos.x - 50) * 0.12}deg) rotateX(${(mousePos.y - 50) * -0.12}deg)`,
              }}
            >
              {/* Warm Backlit Aura */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[#E4C79B]/20 blur-3xl rounded-full scale-125 pointer-events-none"
              />

              {/* The Vertical Portrait Glass Flacon */}
              <div className="relative overflow-hidden rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.95)] border border-white/10 max-h-[440px] sm:max-h-[480px]">
                <img
                  src={flaconImg}
                  alt={activeProduct.name}
                  className="w-auto h-[360px] sm:h-[420px] object-cover select-none"
                />

                {/* Dynamic Specular Sheen Reflection Layer */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-65 transition-opacity"
                  style={{
                    background: `radial-gradient(circle 260px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 235, 190, 0.5), rgba(228, 199, 155, 0.12) 40%, transparent 70%)`,
                  }}
                />

                {/* Direct-on-Glass Gold Foil Embossing Plaque */}
                <div
                  className="absolute inset-x-5 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-3 text-center pointer-events-none backdrop-blur-[3px] bg-black/40 border border-[#E4C79B]/50 rounded shadow-xl"
                  style={{
                    boxShadow: '0 8px 24px rgba(0,0,0,0.8), inset 0 0 12px rgba(228,199,155,0.15)',
                  }}
                >
                  <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#E4C79B] to-transparent mb-1.5" />
                  <p
                    className={`text-sm sm:text-base tracking-[0.16em] uppercase transition-all duration-300 font-semibold ${
                      fontStyle === 'cursive'
                        ? 'font-editorial italic font-normal text-[#FCE6BE]'
                        : 'font-sans font-bold text-xs sm:text-sm tracking-[0.24em] text-[#FCE6BE]'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #FFF9ED 0%, #E4C79B 30%, #D4AF37 55%, #996515 85%, #FFE8B8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95))',
                    }}
                  >
                    {engravingText || 'Your Words Here'}
                  </p>
                  <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#E4C79B] to-transparent mt-1.5" />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar on Plinth */}
            <div className="relative z-20 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8C847A] pt-3 border-t border-white/5">
              <span>{activeProduct.name} · {activeProduct.volumeMl}ml Signature Flacon</span>
              <span className="text-[#E4C79B]">Tilt mouse to inspect gold sheen</span>
            </div>
          </div>

          {/* Right Column: Customization Controls & Instant Acquisition */}
          <div className="lg:col-span-6 space-y-7">
            {/* Step 1: Flacon Visual Switcher Cards */}
            <div className="space-y-2.5">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C8A97E] font-medium">
                1. Select Flacon Edition
              </label>
              <div className="grid grid-cols-3 gap-3">
                {products.slice(0, 3).map((p, idx) => {
                  const isSelected = selectedProductIdx === idx;
                  const thumb = BOTTLE_PORTRAITS[p.id] || p.images[0];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductIdx(idx);
                        atelierAudio.playChime(528, 0.1);
                      }}
                      className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#E4C79B] bg-[#1E1A16] shadow-md ring-1 ring-[#E4C79B]/50'
                          : 'border-[#2B2723] bg-[#12100E] text-[#8C847A] hover:border-[#9A7B4F]'
                      }`}
                    >
                      <div className="aspect-square overflow-hidden bg-black mb-2 rounded-sm">
                        <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-editorial text-sm truncate text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-[#C8A97E] font-mono mt-0.5">${p.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Engraving Inscription Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="studio-engraving-input"
                  className="block text-[10px] uppercase tracking-[0.2em] text-[#C8A97E] font-medium"
                >
                  2. Inscribe Your Words (Max 26 characters)
                </label>
                <span className="text-[10px] font-mono text-[#8C847A]">
                  {engravingText.length}/26
                </span>
              </div>
              <input
                id="studio-engraving-input"
                type="text"
                maxLength={26}
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="e.g. Pour Elena · Oct 14"
                className="w-full bg-[#181614] border border-[#2B2723] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E4C79B] font-editorial tracking-wider rounded-sm shadow-inner"
              />
            </div>

            {/* Step 3: Inspiration Presets */}
            <div className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8C847A]">
                Inspiration Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.text}
                    type="button"
                    onClick={() => handleSelectPreset(preset.text)}
                    className="px-3 py-1.5 text-xs border border-[#2B2723] bg-[#141210] hover:border-[#E4C79B] text-[#C8A97E] transition-colors cursor-pointer flex items-center gap-1.5 rounded-sm"
                  >
                    <span className="text-[9px] uppercase tracking-wider text-[#8C847A]">{preset.label}:</span>
                    <span>&ldquo;{preset.text}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Typography Style Switcher */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C8A97E] font-medium">
                4. Gold Foil Calligraphy Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFontStyle('cursive')}
                  className={`p-3.5 border text-center transition-all cursor-pointer rounded-sm ${
                    fontStyle === 'cursive'
                      ? 'border-[#E4C79B] bg-[#E4C79B]/10 text-[#E4C79B] font-semibold ring-1 ring-[#E4C79B]/40'
                      : 'border-[#2B2723] text-[#8C847A] hover:border-white'
                  }`}
                >
                  <span className="font-editorial italic text-base block text-white">Calligraphie Parisienne</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#C8A97E]">Hand-penned cursive gold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFontStyle('serif')}
                  className={`p-3.5 border text-center transition-all cursor-pointer rounded-sm ${
                    fontStyle === 'serif'
                      ? 'border-[#E4C79B] bg-[#E4C79B]/10 text-[#E4C79B] font-semibold ring-1 ring-[#E4C79B]/40'
                      : 'border-[#2B2723] text-[#8C847A] hover:border-white'
                  }`}
                >
                  <span className="font-sans uppercase tracking-[0.2em] text-xs font-semibold block text-white">
                    Serif Romain Doré
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#C8A97E]">Chiseled Roman caps</span>
                </button>
              </div>
            </div>

            {/* Acquisition & Guarantee Strip */}
            <div className="pt-4 border-t border-[#2B2723] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C847A] block">
                    Complimentary Atelier Service ($45 Value · Free)
                  </span>
                  <span className="font-editorial text-3xl tabular-nums text-white">
                    ${activeProduct.price}
                  </span>
                </div>
                <div className="text-right text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Matching 2ml Tester Vial Included Free</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onExpressOrder(
                      activeProduct,
                      activeProduct.volumeMl,
                      activeProduct.price,
                      engravingText.trim() || undefined
                    )
                  }
                  className="w-full py-4 px-6 bg-[#E4C79B] text-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors cursor-pointer text-center shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-black" />
                  <span>1-Click Order Engraved</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAddToCart(
                      activeProduct,
                      activeProduct.volumeMl,
                      activeProduct.price,
                      engravingText.trim() || undefined
                    )
                  }
                  className="w-full py-4 px-6 border border-[#E4C79B] text-[#E4C79B] hover:bg-[#E4C79B] hover:text-black text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
