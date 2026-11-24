import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  ConcentrationType,
  FragranceFamily,
  PerfumeProduct,
  ProductCategory,
} from '../types/perfume';

interface ProductShowcaseProps {
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
}

const CATEGORIES: Array<'All' | ProductCategory> = [
  'All',
  'Best Sellers',
  'New Arrivals',
  'Exclusive Collections',
  'Limited Editions',
];

const FAMILIES: Array<'All' | FragranceFamily> = [
  'All',
  'Floral',
  'Woody',
  'Oriental',
  'Fresh',
  'Citrus',
  'Gourmand',
];

const CONCENTRATIONS: Array<'All' | ConcentrationType> = [
  'All',
  'Extrait de Parfum',
  'Eau de Parfum',
  'Eau de Toilette',
];

type SortOption = 'bestsellers' | 'trending' | 'newest' | 'price-asc' | 'price-desc';

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
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
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [concentration, setConcentration] = useState<'All' | ConcentrationType>('All');
  const [minLongevity, setMinLongevity] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [occasionFilter, setOccasionFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('bestsellers');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const items: Array<{ label: string; type: string; value: string; kind: 'query' | 'note' | 'family' }> = [];
    for (const p of products) {
      if (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) {
        items.push({ label: `${p.name} — ${p.brand}`, type: p.fragranceFamily, value: p.name, kind: 'query' });
      }
      for (const note of [...p.topNotes, ...p.heartNotes, ...p.baseNotes]) {
        if (note.toLowerCase().includes(q) && !items.some((i) => i.value === note)) {
          items.push({ label: `Ingredient: ${note}`, type: 'Olfactive Note', value: note, kind: 'note' });
        }
      }
    }
    for (const fam of FAMILIES) {
      if (fam !== 'All' && fam.toLowerCase().includes(q)) {
        items.push({ label: `${fam} Fragrance Family`, type: 'Family', value: fam, kind: 'family' });
      }
    }
    return items.slice(0, 6);
  }, [products, searchQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedFamily !== 'All' && p.fragranceFamily !== selectedFamily) return false;
      if (concentration !== 'All' && p.concentration !== concentration) return false;
      if (p.longevityHours < minLongevity) return false;
      if (p.price > maxPrice) return false;
      if (occasionFilter !== 'All' && !p.occasion.includes(occasionFilter)) return false;
      if (selectedNote) {
        const hasNote = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].some(
          (n) => n.toLowerCase() === selectedNote.toLowerCase()
        );
        if (!hasNote) return false;
      }
      if (q) {
        const haystack = [
          p.name,
          p.brand,
          p.fragranceFamily,
          p.concentration,
          p.shortDescription,
          ...p.topNotes,
          ...p.heartNotes,
          ...p.baseNotes,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') {
        return (a.category === 'New Arrivals' ? -1 : 1) - (b.category === 'New Arrivals' ? -1 : 1);
      }
      if (sortBy === 'trending') return b.ratingAvg * b.reviewCount - a.ratingAvg * a.reviewCount;
      return b.popularityScore - a.popularityScore;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedFamily,
    concentration,
    minLongevity,
    maxPrice,
    occasionFilter,
    selectedNote,
    sortBy,
  ]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: dir === 'left' ? -380 : 380,
      behavior: 'smooth',
    });
  };

  const resetAllFilters = () => {
    onSearchChange('');
    onCategoryChange('All');
    onFamilyChange('All');
    onNoteChange('');
    setConcentration('All');
    setMinLongevity(0);
    setMaxPrice(400);
    setOccasionFilter('All');
  };

  return (
    <section id="collections" className="py-24 lg:py-32 px-6 lg:px-10">
      <div className="max-w-[1360px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
              <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                L&apos;Archive Olfactive
              </p>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-balance leading-[1.08]">
              Curated <span className="italic font-normal">Extraits</span> &amp; Signatures
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll curated showcase left"
              className="w-10 h-10 inline-flex items-center justify-center border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll curated showcase right"
              className="w-10 h-10 inline-flex items-center justify-center border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Editorial Highlights Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-7 overflow-x-auto pb-8 mb-16 snap-x snap-mandatory scrollbar-thin"
        >
          {products.slice(0, 6).map((item) => (
            <article
              key={`carousel-${item.id}`}
              className="w-[310px] max-w-[82vw] snap-start group shrink-0 bg-[#F7F4EE] dark:bg-[#141210] border border-[#EAE3D8] dark:border-[#25221E] hover:border-[#C8A97E]/70 transition-colors duration-300"
            >
              <div
                onClick={() => onQuickView(item)}
                className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE2] dark:bg-[#1B1815] cursor-pointer"
              >
                <img
                  src={item.images[0]}
                  alt={`${item.name} — ${item.brand}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />
                {item.images[1] && (
                  <img
                    src={item.images[1]}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                )}
              </div>
              <div className="p-5 flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A7269] dark:text-[#A39C93] truncate">
                    {item.category} · {item.fragranceFamily}
                  </p>
                  <h3 className="font-editorial text-2xl truncate mt-1 group-hover:text-[#9A7B4F] dark:group-hover:text-[#C8A97E] transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-editorial italic text-xs text-[#6B655E] dark:text-[#A39C93] truncate">
                    {item.concentration}
                  </p>
                </div>
                <span className="text-sm tabular-nums font-medium shrink-0">
                  ${item.price}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Category Tabs + Search & Filter Toolbar */}
        <div className="flex flex-col gap-6 pb-8 mb-12 border-b border-[#E5DFD5] dark:border-[#2B2723]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`pb-2 text-[11px] tracking-[0.18em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                    selectedCategory === cat
                      ? 'border-[#9A7B4F] dark:border-[#C8A97E] text-[#161412] dark:text-[#F4F0EA] font-medium'
                      : 'border-transparent text-[#7A7269] dark:text-[#A39C93] hover:text-[#161412] dark:hover:text-[#F4F0EA]'
                  }`}
                >
                  {cat === 'All' ? 'All Creations' : cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Autocomplete Search */}
              <div className="relative flex-1 sm:w-72">
                <Search
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B655E] dark:text-[#A39C93]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setShowAutocomplete(true)}
                  onBlur={() => window.setTimeout(() => setShowAutocomplete(false), 180)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  placeholder="Search scent, house, or note..."
                  aria-label="Search perfumes, houses, ingredients, or families"
                  className="w-full pl-10 pr-8 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25] focus:outline-none focus:border-[#9A7B4F] dark:focus:border-[#C8A97E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B655E] hover:text-[#161412] dark:hover:text-[#F4F0EA] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {showAutocomplete && autocompleteSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#FFFFFF] dark:bg-[#171513] border border-[#D8D0C4] dark:border-[#2E2A25] shadow-lg">
                    {autocompleteSuggestions.map((item) => (
                      <button
                        key={`${item.kind}-${item.label}`}
                        type="button"
                        onMouseDown={() => {
                          if (item.kind === 'note') {
                            onNoteChange(item.value);
                            onSearchChange('');
                          } else if (item.kind === 'family') {
                            onFamilyChange(item.value as FragranceFamily);
                            onSearchChange('');
                          } else {
                            onSearchChange(item.value);
                          }
                          setShowAutocomplete(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#1F1C18] border-b last:border-b-0 border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="text-[#9A7B4F] dark:text-[#C8A97E] uppercase tracking-wider shrink-0 ml-2">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Refine</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort fragrances"
                className="px-3.5 py-2.5 text-xs tracking-[0.1em] uppercase bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25] focus:outline-none cursor-pointer"
              >
                <option value="bestsellers">Sort: Best Sellers</option>
                <option value="trending">Sort: Trending</option>
                <option value="newest">Sort: New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Expandable Advanced Filter Bar */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6 bg-[#F2EEE8] dark:bg-[#171513] border border-[#E5DFD5] dark:border-[#2B2723]">
              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Fragrance Family
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => onFamilyChange(e.target.value as 'All' | FragranceFamily)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                >
                  {FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f === 'All' ? 'All Families' : f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Concentration
                </label>
                <select
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value as 'All' | ConcentrationType)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                >
                  {CONCENTRATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Concentrations' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Min Longevity ({minLongevity}h+)
                </label>
                <select
                  value={minLongevity}
                  onChange={(e) => setMinLongevity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                >
                  <option value={0}>Any Longevity</option>
                  <option value={8}>8+ Hours</option>
                  <option value={12}>12+ Hours</option>
                  <option value={14}>14+ Hours (Extrait)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Occasion
                </label>
                <select
                  value={occasionFilter}
                  onChange={(e) => setOccasionFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                >
                  <option value="All">All Occasions</option>
                  <option value="Daytime">Daytime</option>
                  <option value="Evening">Evening</option>
                  <option value="Black Tie">Black Tie</option>
                  <option value="Signature">Signature</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2 tabular-nums">
                  Price Ceiling: ${maxPrice}
                </label>
                <input
                  type="range"
                  min={150}
                  max={400}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#9A7B4F] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Active Filters Readout (unboxed clean typography) */}
          {(selectedFamily !== 'All' ||
            selectedNote ||
            selectedCategory !== 'All' ||
            concentration !== 'All' ||
            minLongevity > 0 ||
            occasionFilter !== 'All' ||
            searchQuery) && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B655E] dark:text-[#A39C93]">
              <div className="flex flex-wrap items-center gap-3">
                <span>Showing {filteredProducts.length} fragrances</span>
                {selectedFamily !== 'All' && <span>· Family: {selectedFamily}</span>}
                {selectedNote && <span>· Ingredient: {selectedNote}</span>}
                {concentration !== 'All' && <span>· {concentration}</span>}
                {occasionFilter !== 'All' && <span>· {occasionFilter}</span>}
              </div>
              <button
                type="button"
                onClick={resetAllFilters}
                className="underline hover:text-[#161412] dark:hover:text-[#F4F0EA] cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* 3-Column Uniform Product Grid */}
        {filteredProducts.length === 0 ? (
          <div
            id="collection-catalog"
            className="py-20 text-center border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#141210]"
          >
            <p className="font-editorial text-3xl mb-3">No matching fragrances found</p>
            <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
              Try broadening your note or concentration criteria to view the archive.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-6 py-2.5 text-xs tracking-[0.16em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
            >
              Show Complete Collection
            </button>
          </div>
        ) : (
          <div
            id="collection-catalog"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const outOfStock = product.stockCount <= 0;
              const collectionLabel = product.brand.includes('·')
                ? product.brand.split('·')[1].trim()
                : product.brand;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between bg-[#F7F4EE]/70 dark:bg-[#141210] border border-[#EAE3D8] dark:border-[#24211D] hover:border-[#C8A97E]/65 transition-all duration-300"
                >
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE2] dark:bg-[#1B1815]">
                      <img
                        src={product.images[0]}
                        alt={`${product.name} — ${product.brand}`}
                        referrerPolicy="no-referrer"
                        onClick={() => onQuickView(product)}
                        className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(product.id)}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Save ${product.name} to wishlist`
                        }
                        className="absolute top-4 right-4 w-9 h-9 bg-[#FAF8F5]/90 dark:bg-[#0E0D0C]/85 text-[#161412] dark:text-[#F4F0EA] inline-flex items-center justify-center transition-colors hover:text-[#9A7B4F] cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted ? 'fill-[#9A7B4F] text-[#9A7B4F]' : ''
                          }`}
                        />
                      </button>

                      {/* Quick View Overlay Action on hover */}
                      <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        className="absolute bottom-4 left-4 right-4 py-2.5 bg-[#FAF8F5]/95 dark:bg-[#141210]/95 text-[#161412] dark:text-[#F4F0EA] text-[11px] tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Quick View &amp; Notes</span>
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-[#7A7269] dark:text-[#A39C93] mb-2">
                        <span className="truncate">
                          {collectionLabel} · {product.fragranceFamily}
                        </span>
                        <span className="shrink-0">
                          {outOfStock
                            ? 'Awaiting Batch'
                            : product.category === 'Limited Editions'
                            ? 'Limited Run'
                            : `${product.volumeMl} ml`}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4 mb-1">
                        <h3
                          onClick={() => onQuickView(product)}
                          className="font-editorial text-[26px] leading-tight cursor-pointer hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors truncate"
                        >
                          {product.name}
                        </h3>
                        <span className="text-[15px] font-medium tabular-nums shrink-0">
                          ${product.price}
                        </span>
                      </div>

                      <p className="font-editorial italic text-xs text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                        {product.concentration}
                      </p>

                      {product.lifeChapter && (
                        <p className="text-[11px] font-editorial text-[#6B655E] dark:text-[#A39C93] mb-1.5 truncate">
                          Life Chapter: <span className="italic">{product.lifeChapter}</span>
                        </p>
                      )}

                      {product.emotionalResonance && (
                        <p className="text-[10px] tracking-[0.14em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-3 truncate">
                          {product.emotionalResonance}
                        </p>
                      )}

                      <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed line-clamp-2 mb-4">
                        {product.shortDescription}
                      </p>

                      <p className="text-[11px] tracking-[0.06em] text-[#7A7269] dark:text-[#948D84] truncate">
                        {product.topNotes[0]} · {product.heartNotes[0]} · {product.baseNotes[0]}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-1 flex items-center gap-3">
                    {outOfStock ? (
                      <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        className="w-full py-2.5 text-[11px] tracking-[0.18em] uppercase border border-[#161412] dark:border-[#C8A97E] hover:bg-[#161412] hover:text-[#FAF8F5] dark:hover:bg-[#C8A97E] dark:hover:text-[#0E0D0C] transition-colors cursor-pointer"
                      >
                        Request Restock Alert
                      </button>
                    ) : (
                      <div className="w-full flex items-center gap-2">
                        {onExpressOrder && (
                          <button
                            type="button"
                            onClick={() => onExpressOrder(product, product.volumeMl)}
                            className="flex-1 py-2.5 text-[10px] tracking-[0.18em] uppercase bg-[#E4C79B] text-[#0E0D0C] hover:bg-[#FAF8F5] transition-colors cursor-pointer font-semibold shadow-xs"
                          >
                            1-Click Order
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onAddToCart(product, product.volumeMl)}
                          className={`${
                            onExpressOrder ? 'flex-1' : 'w-full'
                          } py-2.5 text-[10px] tracking-[0.16em] uppercase border border-[#161412] dark:border-[#C8A97E] text-[#161412] dark:text-[#FAF8F5] hover:bg-[#161412] hover:text-[#FAF8F5] dark:hover:bg-[#C8A97E] dark:hover:text-[#0E0D0C] transition-colors cursor-pointer`}
                        >
                          Add to Bag
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
