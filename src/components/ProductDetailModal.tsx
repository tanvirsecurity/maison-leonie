import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Heart,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  ZoomIn,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PerfumeProduct, ProductReview } from '../types/perfume';
import { OlfactiveTimelineVisualizer } from './OlfactiveTimelineVisualizer';
import {
  createNotificationRecord,
  createRestockAlert,
  dispatchTransactionalEmail,
  fetchProductReviews,
  submitProductReview,
} from '../lib/storeService';

interface ProductDetailModalProps {
  product: PerfumeProduct | null;
  user: User | null;
  isWishlisted: boolean;
  hasPurchased: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (
    product: PerfumeProduct,
    volumeMl: number,
    unitPrice: number,
    engraving?: string
  ) => void;
  onExpressCheckout?: (
    product: PerfumeProduct,
    volumeMl: number,
    unitPrice: number,
    engraving?: string
  ) => void;
  onOpenUnboxing?: (product: PerfumeProduct) => void;
  onRequireAuth: () => void;
}

const VOLUMES = [
  { ml: 50, multiplier: 0.72, label: '50 ml · Travel Edition' },
  { ml: 100, multiplier: 1, label: '100 ml · Signature Flacon' },
  { ml: 200, multiplier: 1.55, label: '200 ml · Collector Amphora' },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  user,
  isWishlisted,
  hasPurchased,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onExpressCheckout,
  onOpenUnboxing,
  onRequireAuth,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(100);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [restockDone, setRestockDone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [engravingText, setEngravingText] = useState('');

  useEffect(() => {
    if (!product) return;
    setSelectedImageIdx(0);
    setZoomed(false);
    setSelectedVolume(product.volumeMl || 100);
    setRestockDone(false);
    setFeedbackMsg(null);
    setEngravingText('');
    setLoadingReviews(true);
    fetchProductReviews(product.id)
      .then((list) => setReviews(list))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [product]);

  if (!product) return null;

  const activeVolumeObj =
    VOLUMES.find((v) => v.ml === selectedVolume) || VOLUMES[1];
  const dynamicPrice =
    product.id === 'coffret-decouverte'
      ? product.price
      : Math.round(product.price * activeVolumeObj.multiplier);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : product.ratingAvg.toFixed(1);

  const handleRestockSubscribe = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      await createRestockAlert(
        user.uid,
        product.id,
        product.name,
        user.email || 'client@maisonleonie.paris'
      );
      await createNotificationRecord(user.uid, {
        type: 'restock',
        title: `Restock Alert Registered: ${product.name}`,
        message: `You will be notified immediately when the next macerated batch of ${product.name} arrives.`,
      });
      await dispatchTransactionalEmail({
        subject: `Maison Léonie · Restock Alert Confirmed for ${product.name}`,
        headline: `Restock Priority Registered`,
        bodyText: `We have reserved a priority restock alert for ${product.name}. You will receive an invitation as soon as the new Grasse batch is bottled.`,
      }).catch(() => {});
      setRestockDone(true);
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Unable to register alert.');
    }
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    setFeedbackMsg(null);
    try {
      const created = await submitProductReview(product.id, {
        title: reviewTitle,
        comment: reviewComment,
        rating: reviewRating,
        verifiedPurchase: hasPurchased,
      });
      setReviews((prev) => [created, ...prev]);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      setFeedbackMsg('Your review has been published to the Maison archive.');
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Failed to publish review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const shareUrl = `${window.location.origin}/?scent=${encodeURIComponent(product.slug)}`;
  const shareText = encodeURIComponent(
    `Discover ${product.name} by ${product.brand} — ${product.shortDescription}`
  );

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} details`}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center items-start p-4 sm:p-6 lg:p-10"
    >
      <div className="relative w-full max-w-[1160px] bg-[#FAF8F5] dark:bg-[#12100E] text-[#161412] dark:text-[#F4F0EA] border border-[#E5DFD5] dark:border-[#2B2723]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product detail modal"
          className="sticky top-4 float-right mr-4 mt-4 z-20 w-10 h-10 bg-[#FAF8F5] dark:bg-[#1B1815] border border-[#E5DFD5] dark:border-[#2B2723] inline-flex items-center justify-center hover:border-[#9A7B4F] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 clear-both">
          {/* Left Column: Multi-Angle Interactive Bottle Gallery */}
          <div className="lg:col-span-6">
            <div
              onClick={() => setZoomed((z) => !z)}
              className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE2] dark:bg-[#1B1815] cursor-zoom-in mb-4"
            >
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={`${product.name} angle ${selectedImageIdx + 1}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                  zoomed ? 'scale-125' : 'scale-100'
                }`}
              />
              <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] uppercase tracking-wider bg-black/65 text-white inline-flex items-center gap-1.5">
                <ZoomIn className="w-3 h-3" aria-hidden="true" />
                <span>{zoomed ? 'Reset Zoom' : 'Inspect Flacon'}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={`${product.id}-img-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedImageIdx(idx);
                    setZoomed(false);
                  }}
                  className={`aspect-[4/3] overflow-hidden border transition-opacity cursor-pointer ${
                    idx === selectedImageIdx
                      ? 'border-[#9A7B4F] dark:border-[#C8A97E] opacity-100'
                      : 'border-[#E5DFD5] dark:border-[#2B2723] opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                <span>{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.fragranceFamily}</span>
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl mb-2">{product.name}</h2>
              {product.subtitle && (
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-4">
                  {product.subtitle}
                </p>
              )}

              <div className="flex items-center justify-between py-4 border-y border-[#E5DFD5] dark:border-[#2B2723] mb-6">
                <span className="text-2xl font-medium tabular-nums">${dynamicPrice}</span>
                <div className="flex items-center gap-2 text-xs text-[#6B655E] dark:text-[#A39C93] tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#9A7B4F] text-[#9A7B4F]" aria-hidden="true" />
                  <span>
                    {avgRating} ({reviews.length} reviews)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {product.stockCount > 0 ? `${product.stockCount} in reserve` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#3A3530] dark:text-[#D5CEC4] mb-6">
                {product.description}
              </p>

              {/* Life Chapter & Emotional Resonance Callout */}
              {(product.lifeChapter || product.lifeMemoryQuote) && (
                <div className="mb-6 p-4 bg-[#FAF6F0] dark:bg-[#181513] border-l-2 border-[#9A7B4F] dark:border-[#C8A97E] space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#9A7B4F] dark:text-[#C8A97E] font-medium">
                    L&apos;Écho de Votre Vie · {product.lifeChapter}
                  </p>
                  {product.lifeMemoryQuote && (
                    <p className="font-editorial text-base italic text-[#4A443D] dark:text-[#EAE3D9]">
                      &ldquo;{product.lifeMemoryQuote}&rdquo;
                    </p>
                  )}
                  {product.emotionalResonance && (
                    <p className="text-[11px] text-[#6B655E] dark:text-[#A39C93]">
                      Emotional Resonance: {product.emotionalResonance}
                    </p>
                  )}
                </div>
              )}

              {/* Volume Selector */}
              {product.id !== 'coffret-decouverte' && (
                <div className="mb-6">
                  <p className="text-xs tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-2.5">
                    Select Flacon Volume
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {VOLUMES.map((vol) => (
                      <button
                        key={vol.ml}
                        type="button"
                        onClick={() => setSelectedVolume(vol.ml)}
                        className={`py-2.5 px-3 text-xs border text-center transition-colors cursor-pointer ${
                          selectedVolume === vol.ml
                            ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                            : 'border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F]'
                        }`}
                      >
                        <span className="block font-medium tabular-nums">{vol.ml} ml</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Complimentary Bespoke Flacon Engraving Studio */}
              <div className="mb-6 p-3.5 bg-[#FFFFFF] dark:bg-[#181513] border border-[#E5DFD5] dark:border-[#2B2723]">
                <label
                  htmlFor="modal-bottle-engraving"
                  className="block text-[11px] uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] font-medium mb-1"
                >
                  Bespoke Bottle Engraving (Complimentary)
                </label>
                <input
                  id="modal-bottle-engraving"
                  type="text"
                  maxLength={26}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="e.g. For Elena · Oct 14 or Begin Again"
                  className="w-full bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-3.5 py-2 text-xs text-[#161412] dark:text-[#FAF8F5] focus:outline-none focus:border-[#9A7B4F] dark:focus:border-[#C8A97E]"
                />
                {engravingText.trim() && (
                  <p className="mt-2 text-xs font-editorial italic text-[#9A7B4F] dark:text-[#E4C79B]">
                    Gold script preview: &ldquo;{engravingText.trim()}&rdquo;
                  </p>
                )}
              </div>

              {/* Primary Buy & Wishlist Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                {product.stockCount > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const finalVol = product.id === 'coffret-decouverte' ? product.volumeMl : selectedVolume;
                        if (onExpressCheckout) {
                          onExpressCheckout(product, finalVol, dynamicPrice, engravingText.trim() || undefined);
                        } else {
                          onAddToCart(product, finalVol, dynamicPrice, engravingText.trim() || undefined);
                        }
                        onClose();
                      }}
                      className="flex-1 py-3.5 px-6 text-xs tracking-[0.18em] uppercase bg-[#E4C79B] text-[#0E0D0C] hover:bg-[#FAF8F5] transition-colors cursor-pointer font-semibold shadow-md flex items-center justify-center gap-2"
                    >
                      <span>1-Click Order (${dynamicPrice})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(
                          product,
                          product.id === 'coffret-decouverte' ? product.volumeMl : selectedVolume,
                          dynamicPrice,
                          engravingText.trim() || undefined
                        );
                        onClose();
                      }}
                      className="py-3.5 px-6 text-xs tracking-[0.18em] uppercase border border-[#161412] dark:border-[#C8A97E] text-[#161412] dark:text-[#FAF8F5] hover:bg-[#161412] hover:text-[#FAF8F5] dark:hover:bg-[#C8A97E] dark:hover:text-[#0E0D0C] transition-colors cursor-pointer font-medium"
                    >
                      Add to Bag
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestockSubscribe}
                    disabled={restockDone}
                    className="flex-1 py-3.5 px-6 text-xs tracking-[0.18em] uppercase border border-[#161412] dark:border-[#C8A97E] inline-flex items-center justify-center gap-2 hover:bg-[#161412] hover:text-[#FAF8F5] dark:hover:bg-[#C8A97E] dark:hover:text-[#0E0D0C] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {restockDone ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Restock Alert Active</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Notify When Restocked</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className="w-12 h-12 border border-[#D8D0C4] dark:border-[#2E2A25] inline-flex items-center justify-center hover:border-[#9A7B4F] cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#9A7B4F] text-[#9A7B4F]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Sample-First 100% Risk-Free Guarantee Callout */}
              <div className="mb-6 p-4 bg-[#FAF6F0] dark:bg-[#181513] border-l-2 border-emerald-500 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Test-On-Skin Guarantee (100% Risk-Free Blind Buy)</span>
                </div>
                <p className="text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
                  Every flacon includes a complimentary matching 2ml vial outside the box. Spray and wear for 5 days. If not completely enamored, return the unopened full flacon for a 100% refund with free insured return shipping.
                </p>
              </div>

              {/* Interactive Unboxing Trigger */}
              {onOpenUnboxing && (
                <button
                  type="button"
                  onClick={() => onOpenUnboxing(product)}
                  className="w-full py-3.5 px-4 mb-6 border border-[#9A7B4F] dark:border-[#E4C79B] text-[#9A7B4F] dark:text-[#E4C79B] hover:bg-[#9A7B4F]/10 text-xs uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Experience L&apos;Art du Coffret (Interactive Unboxing)</span>
                </button>
              )}

              {/* Olfactive Pyramid & Technical Specs */}
              <div className="border-t border-[#E5DFD5] dark:border-[#2B2723] pt-6 mb-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Top Notes
                    </p>
                    <p>{product.topNotes.join(', ')}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Heart Notes
                    </p>
                    <p>{product.heartNotes.join(', ')}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Base Notes
                    </p>
                    <p>{product.baseNotes.join(', ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5DFD5] dark:border-[#2B2723] text-xs">
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Concentration
                    </p>
                    <p>{product.concentration}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Longevity
                    </p>
                    <p className="tabular-nums">{product.longevityHours} Hours</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1">
                      Projection
                    </p>
                    <p>{product.intensity}</p>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5DFD5] dark:border-[#2B2723] text-xs">
                <span className="inline-flex items-center gap-2 uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93]">
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Share Creation</span>
                </span>
                <div className="flex items-center gap-4">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#9A7B4F]"
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#9A7B4F]"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#9A7B4F]"
                  >
                    Pinterest
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="underline hover:text-[#9A7B4F] cursor-pointer"
                  >
                    {copiedLink ? 'Link Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 14-Hour Olfactive Evolution Interactive Architecture */}
        <div className="border-t border-[#E5DFD5] dark:border-[#2B2723]">
          <OlfactiveTimelineVisualizer product={product} />
        </div>

        {/* Editorial Customer Reviews & Submission Section */}
        <div className="border-t border-[#E5DFD5] dark:border-[#2B2723] px-6 sm:px-10 py-10 bg-[#F2EEE8]/60 dark:bg-[#171513]/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-xs tracking-[0.18em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                Patron Impressions
              </p>
              <h3 className="font-editorial text-3xl mb-4">Write a Review</h3>
              <form onSubmit={handlePublishReview} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Rate ${star} stars`}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= reviewRating
                              ? 'fill-[#9A7B4F] text-[#9A7B4F]'
                              : 'text-[#C5BEB3]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Headline of your impression"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                />
                <textarea
                  rows={3}
                  required
                  maxLength={1500}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share how this fragrance wears on your skin..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                />
                {feedbackMsg && (
                  <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E]">{feedbackMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 text-xs tracking-[0.16em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer disabled:opacity-50"
                >
                  {user
                    ? submittingReview
                      ? 'Publishing...'
                      : 'Publish Impression'
                    : 'Sign In to Review'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {loadingReviews ? (
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                  Loading atelier reviews...
                </p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                  Be the first patron to record an impression for {product.name}.
                </p>
              ) : (
                reviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="pb-6 border-b last:border-b-0 border-[#E5DFD5] dark:border-[#2B2723]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B655E] dark:text-[#A39C93] mb-2">
                      <span>
                        {rev.authorName}
                        {rev.verifiedPurchase ? ' · Verified Patron' : ''}
                      </span>
                      <span className="tabular-nums">{rev.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3 h-3 fill-[#9A7B4F] text-[#9A7B4F]"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <h4 className="font-editorial text-xl mb-1">{rev.title}</h4>
                    <p className="text-sm text-[#3A3530] dark:text-[#D5CEC4] leading-relaxed">
                      {rev.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
