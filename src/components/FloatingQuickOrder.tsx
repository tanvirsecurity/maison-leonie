import React, { useState } from 'react';
import { ArrowRight, Check, ShoppingBag, Sparkles, X } from 'lucide-react';
import { CartItem, PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface FloatingQuickOrderProps {
  cart: CartItem[];
  products: PerfumeProduct[];
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  onExpressOrder: (product: PerfumeProduct, volumeMl: number) => void;
  onCopyPromo: (code: string) => void;
}

export const FloatingQuickOrder: React.FC<FloatingQuickOrderProps> = ({
  cart,
  products,
  onOpenCart,
  onOpenCheckout,
  onExpressOrder,
  onCopyPromo,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (isDismissed) return null;

  const totalCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // Default featured product for instant order
  const defaultProduct = products.find((p) => p.id === 'voie-dor') || products[0];

  const handleCopyCode = () => {
    onCopyPromo('LEONIE15');
    setCopiedCode(true);
    atelierAudio.playChime(880, 0.12);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none p-3 sm:p-5 flex justify-center">
      <div className="pointer-events-auto max-w-4xl w-full bg-[#161412]/95 dark:bg-[#0E0D0C]/95 backdrop-blur-md text-[#FAF8F5] border border-[#E4C79B]/40 px-5 py-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Privilege Code & Reassurance */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#24201C] hover:bg-[#352F29] border border-[#E4C79B]/60 text-[10px] tracking-[0.18em] uppercase text-[#E4C79B] transition-colors cursor-pointer"
            title="Click to copy 15% off code"
          >
            {copiedCode ? <Check className="w-3 h-3 text-[#73BA82]" /> : <Sparkles className="w-3 h-3" />}
            <span>{copiedCode ? 'LEONIE15 Copied' : 'LEONIE15 (-15%)'}</span>
          </button>
          <span className="text-xs text-[#BFB7AA] hidden md:inline">
            Complimentary atelier courier over $220
          </span>
        </div>

        {/* Right: Quick Buy or Bag Checkout */}
        <div className="flex items-center gap-3">
          {totalCount > 0 ? (
            <>
              <button
                type="button"
                onClick={onOpenCart}
                className="text-xs text-[#E4C79B] hover:text-white underline tracking-wider cursor-pointer hidden sm:inline"
              >
                Bag ({totalCount}) · ${subtotal}
              </button>
              <button
                type="button"
                onClick={onOpenCheckout}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E4C79B] hover:bg-[#FAF8F5] text-[#0E0D0C] text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors cursor-pointer shadow-md"
              >
                <span>Ready to Order (${subtotal})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-[#D4CDC3] hidden sm:inline font-editorial italic">
                Ready in one look: {defaultProduct?.name} ($340)
              </span>
              <button
                type="button"
                onClick={() => defaultProduct && onExpressOrder(defaultProduct, 100)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E4C79B] hover:bg-[#FAF8F5] text-[#0E0D0C] text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors cursor-pointer shadow-md"
              >
                <span>Express Order {defaultProduct?.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss order bar"
            className="p-1 text-[#8C847A] hover:text-white cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
