import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Compass, Sparkles } from 'lucide-react';
import { OlfactiveLifeCanvas } from '../components/OlfactiveLifeCanvas';
import { PerfumeProduct } from '../types/perfume';

interface LifeChaptersPageProps {
  products: PerfumeProduct[];
  onAddToCartWithEngraving: (product: PerfumeProduct, engraving?: string) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onNavigatePage: (page: string) => void;
}

export const LifeChaptersPage: React.FC<LifeChaptersPageProps> = ({
  products,
  onAddToCartWithEngraving,
  onViewProduct,
  onNavigatePage,
}) => {
  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#0E0D0C] text-[#FAF8F5]">
      {/* Page Hero & Breadcrumb */}
      <div className="border-b border-[#2B2723] bg-gradient-to-b from-[#181512] to-[#0E0D0C] px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-[1360px] mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#8C847A] mb-6">
            <button
              type="button"
              onClick={() => onNavigatePage('home')}
              className="hover:text-[#E4C79B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Maison Léonie</span>
            </button>
            <span>/</span>
            <span className="text-[#E4C79B]">L&apos;Écho de Votre Vie · Life Chapters</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#24201C] border border-[#E4C79B]/40 text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-4">
              <BookOpen className="w-3 h-3" />
              <span>Dedicated Life Sanctuary · Chapters I–VI</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance mb-4">
              Your life, preserved in{' '}
              <span className="italic text-[#E4C79B]">pure extrait de parfum.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#D4CDC3] leading-relaxed">
              Every chapter of human existence—from the dawn of ambition to the healing of silence and
              the intimacy of love—deserves an indelible olfactive anchor. Explore each chapter below,
              discover its resonant frequency, and personalize your flacon with gold leaf engraving.
            </p>
          </div>
        </div>
      </div>

      {/* The Full Interactive Olfactive Life Canvas */}
      <OlfactiveLifeCanvas
        products={products}
        onAddToCartWithEngraving={onAddToCartWithEngraving}
        onViewProduct={onViewProduct}
      />

      {/* Cross-Page Exploration Navigation Bar */}
      <div className="border-t border-[#2B2723] bg-[#141210] py-14 px-6 lg:px-10">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C8A97E] mb-1">
              Continue Your Olfactive Journey
            </p>
            <p className="font-editorial text-2xl text-[#FAF8F5]">
              Looking to preserve a specific memory from your past?
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigatePage('memory-vault')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E4C79B] text-[#0E0D0C] text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-white transition-colors cursor-pointer"
            >
              <span>Enter Memory Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('collections')}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#3A342E] text-white text-[10px] tracking-[0.2em] uppercase hover:border-[#E4C79B] transition-colors cursor-pointer"
            >
              <span>Explore All Flacons</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
