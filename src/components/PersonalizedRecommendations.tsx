import React, { useMemo, useState } from 'react';
import { getPersonalizedRecommendations } from '../lib/recommendations';
import { FragranceFamily, OrderRecord, PerfumeProduct } from '../types/perfume';

interface PersonalizedRecommendationsProps {
  products: PerfumeProduct[];
  recentlyViewedIds: string[];
  wishlistIds: string[];
  orders: OrderRecord[];
  preferredFamilies: FragranceFamily[];
  favoriteNotes: string[];
  onViewProduct: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct) => void;
}

type RecTab = 'selected' | 'love' | 'complete';

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  products,
  recentlyViewedIds,
  wishlistIds,
  orders,
  preferredFamilies,
  favoriteNotes,
  onViewProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<RecTab>('selected');

  const recSets = useMemo(
    () =>
      getPersonalizedRecommendations(products, {
        recentlyViewedIds,
        wishlistIds,
        orders,
        preferredFamilies,
        favoriteNotes,
      }),
    [products, recentlyViewedIds, wishlistIds, orders, preferredFamilies, favoriteNotes]
  );

  const visibleList =
    activeTab === 'selected'
      ? recSets.selectedForYou
      : activeTab === 'love'
      ? recSets.youMayAlsoLove
      : recSets.completeCollection;

  const hasBehaviorSignals =
    recentlyViewedIds.length > 0 ||
    wishlistIds.length > 0 ||
    orders.length > 0 ||
    preferredFamilies.length > 0;

  return (
    <section className="py-24 lg:py-28 px-6 lg:px-10 border-t border-[#E5DFD5] dark:border-[#2B2723]">
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-[1px] w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
              <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                {hasBehaviorSignals ? 'Tailored to Your Visits' : 'Curated by the Maison'}
              </p>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl">
              {activeTab === 'selected'
                ? 'Selected for You'
                : activeTab === 'love'
                ? 'You May Also Love'
                : 'Complete Your Fragrance Collection'}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Recommendation categories"
            className="inline-flex flex-wrap items-center gap-6 self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'selected'}
              onClick={() => setActiveTab('selected')}
              className={`pb-2 text-[11px] tracking-[0.18em] uppercase whitespace-nowrap shrink-0 cursor-pointer border-b transition-colors ${
                activeTab === 'selected'
                  ? 'border-[#9A7B4F] dark:border-[#C8A97E] text-[#161412] dark:text-[#F4F0EA] font-medium'
                  : 'border-transparent text-[#7A7269] dark:text-[#A39C93] hover:text-[#161412] dark:hover:text-[#F4F0EA]'
              }`}
            >
              Selected for You
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'love'}
              onClick={() => setActiveTab('love')}
              className={`pb-2 text-[11px] tracking-[0.18em] uppercase whitespace-nowrap shrink-0 cursor-pointer border-b transition-colors ${
                activeTab === 'love'
                  ? 'border-[#9A7B4F] dark:border-[#C8A97E] text-[#161412] dark:text-[#F4F0EA] font-medium'
                  : 'border-transparent text-[#7A7269] dark:text-[#A39C93] hover:text-[#161412] dark:hover:text-[#F4F0EA]'
              }`}
            >
              You May Also Love
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'complete'}
              onClick={() => setActiveTab('complete')}
              className={`pb-2 text-[11px] tracking-[0.18em] uppercase whitespace-nowrap shrink-0 cursor-pointer border-b transition-colors ${
                activeTab === 'complete'
                  ? 'border-[#9A7B4F] dark:border-[#C8A97E] text-[#161412] dark:text-[#F4F0EA] font-medium'
                  : 'border-transparent text-[#7A7269] dark:text-[#A39C93] hover:text-[#161412] dark:hover:text-[#F4F0EA]'
              }`}
            >
              Complete Collection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleList.map((product) => (
            <article
              key={`rec-${activeTab}-${product.id}`}
              className="group flex flex-col justify-between border border-[#EAE3D8] dark:border-[#24211D] bg-[#F7F4EE]/70 dark:bg-[#141210] hover:border-[#C8A97E]/65 transition-colors duration-300"
            >
              <div>
                <div
                  onClick={() => onViewProduct(product)}
                  className="aspect-[4/3] overflow-hidden bg-[#EFEAE2] dark:bg-[#1B1815] cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#7A7269] dark:text-[#A39C93] mb-1.5">
                    {product.fragranceFamily} ·{' '}
                    <span className="font-editorial italic normal-case text-xs text-[#9A7B4F] dark:text-[#C8A97E]">
                      {product.concentration}
                    </span>
                  </p>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3
                      onClick={() => onViewProduct(product)}
                      className="font-editorial text-2xl cursor-pointer group-hover:text-[#9A7B4F] dark:group-hover:text-[#C8A97E] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <span className="text-sm font-medium tabular-nums">${product.price}</span>
                  </div>
                  <p className="text-sm text-[#6B655E] dark:text-[#A39C93] line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product)}
                  className="flex-1 py-2.5 text-[11px] tracking-[0.18em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer disabled:opacity-50"
                >
                  {product.stockCount > 0 ? 'Add to Bag' : 'Awaiting Batch'}
                </button>
                <button
                  type="button"
                  onClick={() => onViewProduct(product)}
                  className="px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] transition-colors cursor-pointer"
                >
                  Explore
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
