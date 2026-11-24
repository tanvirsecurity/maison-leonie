import React from 'react';
import { ArrowLeft, ArrowRight, Flower2, Sparkles } from 'lucide-react';
import { OlfactiveDiscovery } from '../components/OlfactiveDiscovery';
import { FragranceFamily, PerfumeProduct } from '../types/perfume';

interface BotanicalDiscoveryPageProps {
  products: PerfumeProduct[];
  onSelectNoteFilter: (note: string) => void;
  onSelectFamilyFilter: (family: FragranceFamily) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onNavigatePage: (page: string) => void;
}

export const BotanicalDiscoveryPage: React.FC<BotanicalDiscoveryPageProps> = ({
  products,
  onSelectNoteFilter,
  onSelectFamilyFilter,
  onViewProduct,
  onNavigatePage,
}) => {
  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#FAF8F5] dark:bg-[#12100E] text-[#161412] dark:text-[#FAF8F5]">
      {/* Page Hero & Breadcrumb */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#F5EFE6] dark:bg-[#161412] px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-[1360px] mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#8C847A] mb-6">
            <button
              type="button"
              onClick={() => onNavigatePage('home')}
              className="hover:text-[#9A7B4F] dark:hover:text-[#E4C79B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Maison Léonie</span>
            </button>
            <span>/</span>
            <span className="text-[#9A7B4F] dark:text-[#E4C79B]">Atelier Botanique · Ingredients &amp; Notes</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#201D1A] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-4">
              <Flower2 className="w-3 h-3" />
              <span>Domaine des Oliviers · Grasse Raw Materials</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance mb-4">
              The living library of <span className="italic text-[#9A7B4F] dark:text-[#E4C79B]">botanical essences.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Explore the perfumer’s organ: cold-pressed Calabrian bergamot, dawn-harvested Grasse jasmine,
              aged Florentine iris rhizomes, and wild cistus resins that form the signature chords of Maison Léonie.
            </p>
          </div>
        </div>
      </div>

      {/* The Full Interactive Olfactive Discovery Component */}
      <OlfactiveDiscovery
        products={products}
        onSelectNoteFilter={(note) => {
          onSelectNoteFilter(note);
          onNavigatePage('collections');
        }}
        onSelectFamilyFilter={(fam) => {
          onSelectFamilyFilter(fam);
          onNavigatePage('collections');
        }}
        onViewProduct={onViewProduct}
      />
    </div>
  );
};
