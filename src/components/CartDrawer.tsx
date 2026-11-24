import React, { useState } from 'react';
import { ArrowRight, Heart, Minus, Plus, Trash2, X } from 'lucide-react';
import { CartItem, PerfumeProduct } from '../types/perfume';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  wishlistProducts: PerfumeProduct[];
  onClose: () => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveWishlistToCart: (product: PerfumeProduct) => void;
  onRemoveWishlist: (productId: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  wishlistProducts,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onMoveWishlistToCart,
  onRemoveWishlist,
  onProceedCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'bag' | 'wishlist'>('bag');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const complimentaryThreshold = 220;
  const remainingForFreeShipping = Math.max(0, complimentaryThreshold - subtotal);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Wishlist"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md h-full bg-[#FAF8F5] dark:bg-[#12100E] text-[#161412] dark:text-[#F4F0EA] border-l border-[#E5DFD5] dark:border-[#2B2723] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5DFD5] dark:border-[#2B2723] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('bag')}
              className={`text-xs tracking-[0.18em] uppercase pb-1 border-b transition-colors cursor-pointer ${
                activeTab === 'bag'
                  ? 'border-[#9A7B4F] text-[#161412] dark:text-[#F4F0EA]'
                  : 'border-transparent text-[#6B655E] dark:text-[#A39C93]'
              }`}
            >
              Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`text-xs tracking-[0.18em] uppercase pb-1 border-b transition-colors cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'border-[#9A7B4F] text-[#161412] dark:text-[#F4F0EA]'
                  : 'border-transparent text-[#6B655E] dark:text-[#A39C93]'
              }`}
            >
              Wishlist ({wishlistProducts.length})
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 hover:text-[#9A7B4F] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {activeTab === 'bag' ? (
          <>
            <div className="px-6 py-3 bg-[#F2EEE8] dark:bg-[#171513] border-b border-[#E5DFD5] dark:border-[#2B2723] text-xs text-[#6B655E] dark:text-[#A39C93]">
              {remainingForFreeShipping === 0
                ? 'Your order qualifies for Complimentary Atelier Courier & two gift samples.'
                : `Add $${remainingForFreeShipping} more for Complimentary Atelier Courier shipping.`}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-editorial text-2xl mb-2">Your bag is empty</p>
                  <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                    Explore our extraits or review your saved wishlist selections.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-6 border-b border-[#E5DFD5] dark:border-[#2B2723]"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover bg-[#EFEAE2] dark:bg-[#1E1B18] shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-editorial text-xl truncate">{item.productName}</h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remove ${item.productName}`}
                            className="text-[#6B655E] hover:text-[#161412] dark:hover:text-[#F4F0EA] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                          {item.brand} · {item.volumeMl} ml
                        </p>
                        {item.engraving && (
                          <p className="text-[11px] font-editorial italic text-[#9A7B4F] dark:text-[#E4C79B] mt-1">
                            Gold script: &ldquo;{item.engraving}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-[#D8D0C4] dark:border-[#2E2A25]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-8 h-8 inline-flex items-center justify-center hover:bg-[#F2EEE8] dark:hover:bg-[#1E1B18] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-8 h-8 inline-flex items-center justify-center hover:bg-[#F2EEE8] dark:hover:bg-[#1E1B18] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium tabular-nums">
                          ${item.unitPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#141210]">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#6B655E] dark:text-[#A39C93]">Estimated Subtotal</span>
                  <span className="font-medium tabular-nums">${subtotal}</span>
                </div>
                <p className="text-xs text-[#6B655E] dark:text-[#A39C93] mb-5">
                  Promo codes, taxes, and Apple Pay / courier options calculated at checkout.
                </p>
                <button
                  type="button"
                  onClick={onProceedCheckout}
                  className="w-full py-3.5 px-6 text-xs tracking-[0.18em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] inline-flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {wishlistProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Heart className="w-6 h-6 mx-auto mb-3 text-[#9A7B4F]" aria-hidden="true" />
                <p className="font-editorial text-2xl mb-2">No saved fragrances yet</p>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                  Tap the heart on any creation to curate your personal scent wardrobe.
                </p>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 pb-5 border-b border-[#E5DFD5] dark:border-[#2B2723]"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover bg-[#EFEAE2] dark:bg-[#1E1B18] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-editorial text-xl truncate">{product.name}</h4>
                        <button
                          type="button"
                          onClick={() => onRemoveWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="text-xs text-[#6B655E] hover:text-[#161412] dark:hover:text-[#F4F0EA] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-[#6B655E] dark:text-[#A39C93] tabular-nums">
                        {product.fragranceFamily} · ${product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={product.stockCount <= 0}
                      onClick={() => {
                        onMoveWishlistToCart(product);
                        setActiveTab('bag');
                      }}
                      className="mt-3 py-2 px-4 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer disabled:opacity-50"
                    >
                      {product.stockCount > 0 ? 'Move to Bag' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
