import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { FragranceQuiz } from '../components/FragranceQuiz';
import { PerfumeProduct, QuizAnswers } from '../types/perfume';

interface ScentQuizPageProps {
  products: PerfumeProduct[];
  onAddToCart: (product: PerfumeProduct) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onSaveQuizProfile?: (answers: QuizAnswers, summary: string) => void;
  onNavigatePage: (page: string) => void;
}

export const ScentQuizPage: React.FC<ScentQuizPageProps> = ({
  products,
  onAddToCart,
  onViewProduct,
  onSaveQuizProfile,
  onNavigatePage,
}) => {
  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#F2EEE8]/50 dark:bg-[#141210] text-[#161412] dark:text-[#FAF8F5]">
      {/* Page Hero & Breadcrumb */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#110F0E] px-6 lg:px-10 py-12 lg:py-16">
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
            <span className="text-[#9A7B4F] dark:text-[#E4C79B]">Consultation Privée · Scent Profiling</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#1D1A17] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-4">
              <UserCheck className="w-3 h-3" />
              <span>Bespoke Olfactive Profiling · 6 Considerations</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance mb-4">
              Personalized <span className="italic text-[#9A7B4F] dark:text-[#E4C79B]">Fragrance</span> Profiling.
            </h1>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Six considered questions composed by our Grasse perfumers to align your wardrobe,
              atmosphere, emotional season, and skin chemistry with your signature Maison Léonie extrait.
            </p>
          </div>
        </div>
      </div>

      {/* The Full Interactive Fragrance Quiz Component */}
      <FragranceQuiz
        products={products}
        onAddToCart={onAddToCart}
        onViewProduct={onViewProduct}
        onSaveQuizProfile={onSaveQuizProfile}
      />
    </div>
  );
};
