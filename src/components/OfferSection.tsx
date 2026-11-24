import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OfferSectionProps {
  onExploreCollection: () => void;
  onCopyPromo?: (code: string) => void;
}

const offerVideo = new URL('../../Down Hero Section Background video.mp4', import.meta.url).href;

export const OfferSection: React.FC<OfferSectionProps> = ({ onExploreCollection, onCopyPromo }) => (
  <section
    id="atelier-offer"
    className="relative isolate flex min-h-[520px] items-center justify-center overflow-hidden bg-[#12100E] text-[#FAF8F5]"
  >
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={offerVideo} type="video/mp4" />
    </video>
    <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-r from-[#0D0B09]/75 via-[#0D0B09]/35 to-[#0D0B09]/60"
    />

    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 text-center">
      <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#E4C79B]">
        A welcome from our atelier
      </p>
      <h2 className="font-editorial text-4xl font-normal leading-tight sm:text-6xl lg:text-7xl">
        Some moments
        <br />
        <span className="italic text-[#E4C79B]">stay on the skin.</span>
      </h2>
      <p className="mt-7 font-editorial text-3xl sm:text-4xl">
        15% off your order
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/80">
        Use code{' '}
        <button
          type="button"
          onClick={() => onCopyPromo && onCopyPromo('LEONIE15')}
          className="font-semibold text-[#E4C79B] underline decoration-dotted hover:text-white cursor-pointer transition-colors"
          title="Click to copy LEONIE15"
        >
          LEONIE15
        </button>{' '}
        at checkout (Click to copy)
      </p>
      <button
        type="button"
        onClick={onExploreCollection}
        className="mt-9 inline-flex items-center gap-3 bg-[#FAF8F5] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-[#161412] transition-colors hover:bg-[#E4C79B] cursor-pointer font-medium"
      >
        Explore the collection
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  </section>
);
