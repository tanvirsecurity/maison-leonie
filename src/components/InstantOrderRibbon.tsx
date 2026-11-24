import React, { useState } from 'react';
import { ArrowRight, Check, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface InstantOrderRibbonProps {
  products: PerfumeProduct[];
  onExpressOrder: (product: PerfumeProduct, volumeMl: number) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl: number) => void;
  onViewProduct: (product: PerfumeProduct) => void;
}

export const InstantOrderRibbon: React.FC<InstantOrderRibbonProps> = ({
  products,
  onExpressOrder,
  onAddToCart,
  onViewProduct,
}) => {
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, number>>({
    'voie-dor': 100,
    'ember-noir': 100,
    'lumiere-cherie': 100,
    'coffret-decouverte': 60,
  });

  const featuredIds = ['voie-dor', 'ember-noir', 'lumiere-cherie', 'coffret-decouverte'];
  const featured = featuredIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is PerfumeProduct => Boolean(p));

  const handleVolumeChange = (productId: string, vol: number) => {
    setSelectedVolumes((prev) => ({ ...prev, [productId]: vol }));
    atelierAudio.playChime(660, 0.08);
  };

  const calculatePrice = (product: PerfumeProduct, vol: number) => {
    if (product.id === 'coffret-decouverte') return product.price;
    return Math.round(product.price * (vol === 50 ? 0.72 : vol === 200 ? 1.55 : 1));
  };

  return (
    <section
      id="express-order-ribbon"
      className="relative z-20 bg-[#FAF8F5] dark:bg-[#141210] border-y border-[#E5DFD5] dark:border-[#2B2723] py-10 px-6 lg:px-10 shadow-sm"
    >
      <div className="max-w-[1360px] mx-auto">
        {/* Ribbon Bar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E5DFD5] dark:border-[#2B2723]">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#E4C79B]" />
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#9A7B4F] dark:text-[#E4C79B] font-semibold">
                Express Acquisition · Ready in One Look
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#161412] dark:text-[#FAF8F5]">
              Iconic Extraits Available for Immediate Dispatch
            </h2>
          </div>

          {/* Reassurance Trust Signals */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B655E] dark:text-[#A39C93]">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#E4C79B]" />
              <span>Ships within 24h</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#E4C79B]" />
              <span>Complimentary Courier over $220</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#E4C79B]" />
              <span>2 Gift Discovery Samples Included</span>
            </span>
          </div>
        </div>

        {/* 4-Item Quick-Order Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => {
            const currentVol = selectedVolumes[p.id] || p.volumeMl || 100;
            const currentPrice = calculatePrice(p, currentVol);
            const isOutOfStock = p.stockCount <= 0;

            return (
              <div
                key={p.id}
                className="group p-5 bg-[#FFFFFF] dark:bg-[#181513] border border-[#E5DFD5] dark:border-[#26221E] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Bottle thumbnail and info */}
                  <div
                    onClick={() => onViewProduct(p)}
                    className="relative aspect-square overflow-hidden bg-[#EFEAE2] dark:bg-[#1E1B18] mb-4 cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[9px] uppercase tracking-[0.16em]">
                      {p.fragranceFamily}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C847A] truncate">
                      {p.subtitle || p.brand}
                    </p>
                    <h3
                      onClick={() => onViewProduct(p)}
                      className="font-editorial text-xl cursor-pointer hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors truncate"
                    >
                      {p.name}
                    </h3>
                  </div>

                  {/* Volume Toggles */}
                  {p.id !== 'coffret-decouverte' ? (
                    <div className="flex items-center gap-1.5 mb-4">
                      {[50, 100].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleVolumeChange(p.id, v)}
                          className={`flex-1 py-1 text-[10px] tracking-wider uppercase border transition-colors cursor-pointer ${
                            currentVol === v
                              ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] font-semibold'
                              : 'border-[#DCD5CB] dark:border-[#2E2A25] text-[#6B655E] dark:text-[#A39C93] hover:border-[#9A7B4F]'
                          }`}
                        >
                          {v} ml
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-1 text-[10px] tracking-wider uppercase text-[#8C847A] mb-4">
                      Complete 6 × 10 ml Set
                    </div>
                  )}
                </div>

                {/* Price & Direct Actions */}
                <div className="pt-3 border-t border-[#EAE3D8] dark:border-[#26221E]">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-editorial text-2xl font-normal text-[#161412] dark:text-[#FAF8F5]">
                      ${currentPrice}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#73BA82]">
                      {isOutOfStock ? 'Sold out' : 'In Stock · Ready'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        onExpressOrder(p, currentVol);
                        atelierAudio.playChime(880, 0.15);
                      }}
                      className="w-full py-2.5 px-3 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#9A7B4F] dark:hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>1-Click Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => onAddToCart(p, currentVol)}
                      className="w-full py-1.5 px-3 border border-[#DCD5CB] dark:border-[#2E2A25] hover:border-[#9A7B4F] text-[10px] tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] transition-colors cursor-pointer"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
