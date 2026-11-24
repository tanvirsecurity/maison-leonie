import React from 'react';
import { ArrowRight, BookOpen, Clock, Compass, History, Layers, Quote, Sparkles, UserCheck } from 'lucide-react';
import { HeroCinematic } from '../components/HeroCinematic';
import { InstantOrderRibbon } from '../components/InstantOrderRibbon';
import { OfferSection } from '../components/OfferSection';
import { ScentMoments } from '../components/ScentMoments';
import { FragranceFamily, PerfumeProduct } from '../types/perfume';
import { LIFE_CHAPTERS } from '../data/perfumes';
import { FlaconEngravingStudio } from '../components/FlaconEngravingStudio';

interface HomePageProps {
  products: PerfumeProduct[];
  onExpressOrder: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl: number, unitPrice?: number, engraving?: string) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onNavigatePage: (page: string) => void;
  onCopyPromo: (code: string) => void;
  onChooseFamily: (family: FragranceFamily) => void;
  onOpenUnboxing?: (product: PerfumeProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onExpressOrder,
  onAddToCart,
  onViewProduct,
  onNavigatePage,
  onCopyPromo,
  onChooseFamily,
  onOpenUnboxing,
}) => {
  return (
    <div>
      {/* 1. Cinematic Hero with Direct Page Navigation */}
      <HeroCinematic
        onDiscoverScent={() => onNavigatePage('quiz')}
        onExploreCollection={() => onNavigatePage('collections')}
        onExploreLifeChapters={() => onNavigatePage('chapters')}
        onExploreMemoryVault={() => onNavigatePage('memory-vault')}
        onQuickOrder={() => {
          const el = document.getElementById('express-order-ribbon');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else onNavigatePage('collections');
        }}
      />

      {/* 2. Ready in One Look: Express Acquisition Strip */}
      <InstantOrderRibbon
        products={products}
        onExpressOrder={onExpressOrder}
        onAddToCart={onAddToCart}
        onViewProduct={onViewProduct}
      />

      {/* 3. Welcome Atelier Offer (-15% Privilege) */}
      <OfferSection
        onExploreCollection={() => onNavigatePage('collections')}
        onCopyPromo={onCopyPromo}
      />

      {/* 4. Dedicated Page Gateway 1: L'Écho de Votre Vie · Life Chapters */}
      <section className="py-24 px-6 lg:px-10 bg-[#0E0D0C] text-[#FAF8F5] border-b border-[#2B2723] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-[#9A7B4F]/10 blur-[130px] pointer-events-none rounded-full"
        />
        <div className="max-w-[1360px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E1B18] border border-[#E4C79B]/40 text-[#E4C79B] text-[10px] tracking-[0.24em] uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dedicated Page · L&apos;Écho de Votre Vie</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance">
              Your life is not measured in years.
              <span className="block italic text-[#E4C79B]">It is remembered in scent.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#BFB7AA] leading-relaxed">
              From the morning you found your courage, to the healing season of gentle rebirth,
              and the solitude that became your sanctuary. Six dedicated life chapters, each with its
              resonant frequency and complimentary gold leaf flacon engraving.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigatePage('chapters')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#E4C79B] text-[#0E0D0C] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-white transition-colors cursor-pointer shadow-lg"
              >
                <span>Enter All 6 Life Chapters</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {LIFE_CHAPTERS.slice(0, 4).map((chap) => (
              <div
                key={chap.id}
                onClick={() => onNavigatePage('chapters')}
                className="group p-5 bg-[#151311] border border-[#2B2723] hover:border-[#E4C79B] transition-all cursor-pointer flex flex-col justify-between aspect-[4/5]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#1E1B18] mb-3">
                  <img
                    src={chap.image}
                    alt={chap.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-[#E4C79B] text-[9px] uppercase tracking-wider font-editorial">
                    Chapter {chap.numeral}
                  </div>
                </div>
                <div>
                  <h3 className="font-editorial text-lg text-white group-hover:text-[#E4C79B] transition-colors truncate">
                    {chap.title}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-[#8C847A] truncate">
                    {chap.resonantAura}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5. The Bespoke Flacon Engraving Studio (Live Interactive 24k Gold Foil Embossing) */}
      <FlaconEngravingStudio
        products={products}
        onExpressOrder={(p, vol, price, eng) => onExpressOrder(p, vol, price, eng)}
        onAddToCart={(p, vol, price, eng) => onAddToCart(p, vol, price, eng)}
      />

      {/* 4.6. L'Art du Coffret Unboxing Presentation Banner */}
      <section className="py-20 px-6 lg:px-10 bg-[#141210] border-b border-[#2B2723] text-white">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#E4C79B] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>L&apos;Art du Coffret · Pure Luxury Ritual</span>
            </div>
            <h3 className="font-editorial text-3xl sm:text-4xl">
              Experience the unboxing ritual before ordering.
            </h3>
            <p className="text-xs sm:text-sm text-[#A39C93] max-w-2xl leading-relaxed">
              Every Maison Léonie flacon arrives sealed by hand with molten crimson wax in our custom Belgian linen coffret, accompanied by a matching 2ml exterior tester vial for our 100% risk-free skin trial.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <button
              type="button"
              onClick={() => onOpenUnboxing && onOpenUnboxing(products[0])}
              className="px-8 py-4 bg-[#FAF8F5] text-[#12100E] hover:bg-[#E4C79B] transition-colors text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer shadow-lg flex items-center gap-3"
            >
              <span>Part the Wax Seal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Dedicated Page Gateway 2: Le Coffre aux Souvenirs · Memory Vault */}
      <section className="py-24 px-6 lg:px-10 bg-[#FAF8F5] dark:bg-[#12100E] border-b border-[#E5DFD5] dark:border-[#2B2723]">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#1E1B18] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.24em] uppercase">
              <History className="w-3.5 h-3.5" />
              <span>Dedicated Page · Le Coffre aux Souvenirs</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance">
              The Memory Vault.
              <span className="block italic text-[#9A7B4F] dark:text-[#E4C79B]">
                Prescribe an olfactive anchor.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Type any feeling, memory, or human season into our semantic archive: walking through
              autumn rain, your mother’s sunlit linen, or the late-night balcony talk with someone you loved.
              Our Grasse perfumers synthesize your bespoke memory prescription.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigatePage('memory-vault')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-[#9A7B4F] dark:hover:bg-white transition-colors cursor-pointer"
              >
                <span>Open the Memory Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#181513] border border-[#E5DFD5] dark:border-[#2B2723] p-8 shadow-md space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B] font-medium">
              Sample Memory Prescriptions
            </p>
            <div className="space-y-3 text-xs">
              <div
                onClick={() => onNavigatePage('memory-vault')}
                className="p-3.5 bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#E5DFD5] dark:border-[#26221E] hover:border-[#9A7B4F] cursor-pointer transition-colors"
              >
                <p className="font-editorial italic text-base mb-1 text-[#161412] dark:text-[#FAF8F5]">
                  &ldquo;Walking through wet autumn leaves after rain in Paris&rdquo;
                </p>
                <p className="text-[#8C847A] text-[10px] uppercase tracking-wider">
                  Prescription: Ember Noir · Assam Smoked Oud &amp; Cardamom
                </p>
              </div>

              <div
                onClick={() => onNavigatePage('memory-vault')}
                className="p-3.5 bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#E5DFD5] dark:border-[#26221E] hover:border-[#9A7B4F] cursor-pointer transition-colors"
              >
                <p className="font-editorial italic text-base mb-1 text-[#161412] dark:text-[#FAF8F5]">
                  &ldquo;My mother’s freshly laundered linen sheets in summer sun&rdquo;
                </p>
                <p className="text-[#8C847A] text-[10px] uppercase tracking-wider">
                  Prescription: Lumière Chérie · Florentine Iris &amp; Ambrette
                </p>
              </div>

              <div
                onClick={() => onNavigatePage('memory-vault')}
                className="p-3.5 bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#E5DFD5] dark:border-[#26221E] hover:border-[#9A7B4F] cursor-pointer transition-colors"
              >
                <p className="font-editorial italic text-base mb-1 text-[#161412] dark:text-[#FAF8F5]">
                  &ldquo;Standing on a foreign coast for the first time with an open heart&rdquo;
                </p>
                <p className="text-[#8C847A] text-[10px] uppercase tracking-wider">
                  Prescription: Aurore Luminaire · Neroli &amp; Wild Fig Nectar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dedicated Page Gateway 3: Daily Rituals & Scent Layering */}
      <section className="py-24 px-6 lg:px-10 bg-[#F5EFE6] dark:bg-[#100E0C] border-b border-[#E5DFD5] dark:border-[#2B2723]">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#181513] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.24em] uppercase">
              <Clock className="w-3.5 h-3.5" />
              <span>Dedicated Page · Le Rituel Quotidien</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance">
              The 24-Hour Life Rhythm.
              <span className="block italic text-[#9A7B4F] dark:text-[#E4C79B]">
                And the art of scent layering.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              We do not remain in a single emotional state through the day. Discover the 4 daily
              ritual checkpoints (07:00, 13:00, 19:30, 23:30) and master the dual-accord layering
              laboratory to craft an aroma that exists only on your skin.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigatePage('rituals')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-[#9A7B4F] transition-colors cursor-pointer"
              >
                <span>Explore 24H Rituals &amp; Layering</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div
              onClick={() => onNavigatePage('rituals')}
              className="p-6 bg-[#FFFFFF] dark:bg-[#161412] border border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer hover:border-[#9A7B4F] transition-all"
            >
              <span className="font-editorial text-3xl text-[#9A7B4F] dark:text-[#E4C79B]">07:00</span>
              <p className="font-editorial text-xl mt-1 mb-1">First Light &amp; Awakening</p>
              <p className="text-xs text-[#8C847A]">L&apos;Éclat · Bergamot &amp; White Tea</p>
            </div>

            <div
              onClick={() => onNavigatePage('rituals')}
              className="p-6 bg-[#FFFFFF] dark:bg-[#161412] border border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer hover:border-[#9A7B4F] transition-all"
            >
              <span className="font-editorial text-3xl text-[#9A7B4F] dark:text-[#E4C79B]">13:00</span>
              <p className="font-editorial text-xl mt-1 mb-1">Midday Poise &amp; Flow</p>
              <p className="text-xs text-[#8C847A]">Lumière Chérie · Iris &amp; Peony</p>
            </div>

            <div
              onClick={() => onNavigatePage('rituals')}
              className="p-6 bg-[#FFFFFF] dark:bg-[#161412] border border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer hover:border-[#9A7B4F] transition-all"
            >
              <span className="font-editorial text-3xl text-[#9A7B4F] dark:text-[#E4C79B]">19:30</span>
              <p className="font-editorial text-xl mt-1 mb-1">Twilight Metamorphosis</p>
              <p className="text-xs text-[#8C847A]">Voie d&apos;Or · Saffron &amp; Jasmine</p>
            </div>

            <div
              onClick={() => onNavigatePage('rituals')}
              className="p-6 bg-[#FFFFFF] dark:bg-[#161412] border border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer hover:border-[#9A7B4F] transition-all"
            >
              <span className="font-editorial text-3xl text-[#9A7B4F] dark:text-[#E4C79B]">23:30</span>
              <p className="font-editorial text-xl mt-1 mb-1">Slumber &amp; Pillow Mist</p>
              <p className="text-xs text-[#8C847A]">Sandalwood Amber · Cedar &amp; Musk</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Scent Moments Teaser */}
      <ScentMoments onChooseFamily={onChooseFamily} />

      {/* 8. Dedicated Page Gateway 4: Complete Flacons Collection */}
      <section className="py-24 px-6 lg:px-10 bg-[#FAF8F5] dark:bg-[#0E0D0C] border-b border-[#E5DFD5] dark:border-[#2B2723]">
        <div className="max-w-[1360px] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.24em] uppercase mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Page · Complete Flacons Collection</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight max-w-3xl mx-auto">
            Discover every extrait in our{' '}
            <span className="italic text-[#9A7B4F] dark:text-[#E4C79B]">permanent archive.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] max-w-xl mx-auto">
            Explore with precision filters across notes, longevity, intensity, and fragrance families,
            or order in 1 click with complimentary atelier courier.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => onNavigatePage('collections')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-[#9A7B4F] transition-colors cursor-pointer shadow-lg"
            >
              <span>Explore The Complete Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Dedicated Page Gateway 5: Human Memoirs & Quiz */}
      <section className="py-24 px-6 lg:px-10 bg-[#F5EFE6] dark:bg-[#141210]">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Memoirs Box */}
          <div className="p-8 sm:p-12 bg-[#FFFFFF] dark:bg-[#191714] border border-[#E5DFD5] dark:border-[#2B2723] flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B] mb-3">
                <Quote className="w-3.5 h-3.5" />
                <span>True Memoirs</span>
              </div>
              <h3 className="font-editorial text-3xl sm:text-4xl mb-4">
                Life Written in Scent
              </h3>
              <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed mb-6">
                Read real accounts from cellists in Vienna and architects in Paris on how Maison Léonie
                anchored defining turning points in their lives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigatePage('memoirs')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#161412] dark:text-[#E4C79B] hover:underline cursor-pointer"
            >
              <span>Read All Human Memoirs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quiz Box */}
          <div className="p-8 sm:p-12 bg-[#FFFFFF] dark:bg-[#191714] border border-[#E5DFD5] dark:border-[#2B2723] flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B] mb-3">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Consultation Privée</span>
              </div>
              <h3 className="font-editorial text-3xl sm:text-4xl mb-4">
                Personalized Fragrance Quiz
              </h3>
              <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed mb-6">
                Six considered questions to align your wardrobe, atmosphere, emotional season,
                and skin chemistry with your signatureextrait.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigatePage('quiz')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#161412] dark:text-[#E4C79B] hover:underline cursor-pointer"
            >
              <span>Begin Private Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
