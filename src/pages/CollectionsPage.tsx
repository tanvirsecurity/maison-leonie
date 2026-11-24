import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { ProductShowcase } from '../components/ProductShowcase';
import { FragranceFamily, PerfumeProduct, ProductCategory } from '../types/perfume';

interface CollectionsPageProps {
  products: PerfumeProduct[];
  wishlistIds: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: 'All' | ProductCategory;
  onCategoryChange: (cat: 'All' | ProductCategory) => void;
  selectedFamily: 'All' | FragranceFamily;
  onFamilyChange: (fam: 'All' | FragranceFamily) => void;
  selectedNote: string;
  onNoteChange: (note: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl?: number) => void;
  onExpressOrder?: (product: PerfumeProduct, volumeMl?: number) => void;
  onNavigatePage: (page: string) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  products,
  wishlistIds,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedFamily,
  onFamilyChange,
  selectedNote,
  onNoteChange,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onExpressOrder,
  onNavigatePage,
}) => {
  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#FAF8F5] dark:bg-[#0E0D0C] text-[#161412] dark:text-[#FAF8F5]">
      {/* Page Hero & Breadcrumb */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#F5EFE6] dark:bg-[#13110F] px-6 lg:px-10 py-12 lg:py-16">
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
            <span className="text-[#9A7B4F] dark:text-[#E4C79B]">Flacons &amp; Extraits Archive</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#201D1A] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Grasse Maceration Archive · Small Numbered Batches</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-tight text-balance mb-4">
              The Permanent Collection of{' '}
              <span className="italic text-[#9A7B4F] dark:text-[#E4C79B]">Extraits de Parfum.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Macerated for twelve to sixteen weeks in French oak vessels to fuse natural florals and resinous woods.
              Each flacon includes complimentary bespoke gold leaf engraving and two discovery samples.
            </p>
          </div>
        </div>
      </div>

      {/* The Full Interactive Product Catalog Showcase */}
      <ProductShowcase
        products={products}
        wishlistIds={wishlistIds}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedFamily={selectedFamily}
        onFamilyChange={onFamilyChange}
        selectedNote={selectedNote}
        onNoteChange={onNoteChange}
        onToggleWishlist={onToggleWishlist}
        onQuickView={onQuickView}
        onAddToCart={onAddToCart}
        onExpressOrder={onExpressOrder}
      />
    </div>
  );
};
