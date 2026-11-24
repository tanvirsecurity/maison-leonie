import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Quote } from 'lucide-react';
import { HumanChronicles } from '../components/HumanChronicles';
import { PerfumeProduct } from '../types/perfume';

interface HumanMemoirsPageProps {
  products: PerfumeProduct[];
  onViewProduct: (product: PerfumeProduct) => void;
  onNavigatePage: (page: string) => void;
}

export const HumanMemoirsPage: React.FC<HumanMemoirsPageProps> = ({
  products,
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
            <span className="text-[#9A7B4F] dark:text-[#E4C79B]">Les Récits Humains · Memoirs</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#201D1A] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-4">
              <Quote className="w-3 h-3" />
              <span>Human Testimonials &amp; Life Memoirs</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance mb-4">
              Life written in <span className="italic text-[#9A7B4F] dark:text-[#E4C79B]">scent.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Read true accounts of how Maison Léonie was the silent companion to real human vulnerability,
              grief, courage, and triumph across Vienna, Paris, and Kyoto.
            </p>
          </div>
        </div>
      </div>

      {/* The Full Interactive Human Chronicles */}
      <HumanChronicles
        products={products}
        onViewProduct={onViewProduct}
      />

      {/* Cross-Page Exploration Navigation Bar */}
      <div className="border-t border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#161412] py-14 px-6 lg:px-10">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#9A7B4F] dark:text-[#C8A97E] mb-1">
              Immerse in the Ingredients
            </p>
            <p className="font-editorial text-2xl text-[#161412] dark:text-[#FAF8F5]">
              Discover the rare botanical essences of Grasse
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigatePage('discovery')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#9A7B4F] transition-colors cursor-pointer"
            >
              <span>Explore Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('collections')}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#DCD5CB] dark:border-[#3A342E] text-[10px] tracking-[0.2em] uppercase hover:border-[#9A7B4F] transition-colors cursor-pointer"
            >
              <span>The Flacons</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
