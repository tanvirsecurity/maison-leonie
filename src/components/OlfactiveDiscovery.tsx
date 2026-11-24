import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ATELIER_IMAGE, OLFACTIVE_NOTES_LIBRARY } from '../data/perfumes';
import { FragranceFamily, PerfumeProduct } from '../types/perfume';

interface OlfactiveDiscoveryProps {
  products: PerfumeProduct[];
  onSelectNoteFilter: (note: string) => void;
  onSelectFamilyFilter: (family: FragranceFamily) => void;
  onViewProduct: (product: PerfumeProduct) => void;
}

const NOTE_TIERS: Array<'Top Notes' | 'Heart Notes' | 'Base Notes'> = [
  'Top Notes',
  'Heart Notes',
  'Base Notes',
];

const FAMILIES: FragranceFamily[] = [
  'Floral',
  'Woody',
  'Oriental',
  'Fresh',
  'Citrus',
  'Gourmand',
];

export const OlfactiveDiscovery: React.FC<OlfactiveDiscoveryProps> = ({
  products,
  onSelectNoteFilter,
  onSelectFamilyFilter,
  onViewProduct,
}) => {
  const [activeTier, setActiveTier] = useState<'Top Notes' | 'Heart Notes' | 'Base Notes'>(
    'Top Notes'
  );
  const [selectedNote, setSelectedNote] = useState(OLFACTIVE_NOTES_LIBRARY[0]);

  const tierNotes = OLFACTIVE_NOTES_LIBRARY.filter((n) => n.tier === activeTier);

  const matchingPerfumes = products.filter((p) =>
    [...p.topNotes, ...p.heartNotes, ...p.baseNotes].some(
      (note) => note.toLowerCase() === selectedNote.name.toLowerCase()
    )
  );

  return (
    <section
      id="discovery"
      className="py-24 lg:py-32 px-6 lg:px-10 border-t border-[#E5DFD5] dark:border-[#2B2723]"
    >
      <div className="max-w-[1360px] mx-auto">
        {/* Atelier Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch mb-24">
          <div className="lg:col-span-7 relative min-h-[340px] lg:min-h-[460px] overflow-hidden bg-[#EFEAE2] dark:bg-[#171513]">
            <img
              src={ATELIER_IMAGE}
              alt="Master perfumer's organ in Grasse with amber apothecary essence bottles"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
              <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                L&apos;Atelier de Grasse
              </p>
            </div>
            <h2 className="font-editorial text-3xl lg:text-5xl leading-[1.1] text-balance mb-5">
              Raw Botanicals, Composed in{' '}
              <span className="italic font-normal">Three Acts.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed mb-8">
              Every Maison Léonie composition evolves gracefully across hours on skin. Explore
              our harvested botanicals across Top, Heart, and Base stages, or filter the salon
              by olfactive family.
            </p>

            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A7269] dark:text-[#A39C93] mb-3">
                Explore by Fragrance Family
              </p>
              <div className="flex flex-wrap gap-2">
                {FAMILIES.map((fam) => (
                  <button
                    key={fam}
                    type="button"
                    onClick={() => onSelectFamilyFilter(fam)}
                    className="px-4 py-2 text-[11px] tracking-[0.16em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Note Pyramid Discovery */}
        <div className="border border-[#EAE3D8] dark:border-[#2B2723] bg-[#FFFFFF]/80 dark:bg-[#141210] p-6 sm:p-10 lg:p-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5DFD5] dark:border-[#2B2723]">
            <div>
              <p className="text-[11px] tracking-[0.24em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                Interactive Note Library
              </p>
              <h3 className="font-editorial text-3xl sm:text-4xl">
                The Fragrance Pyramid
              </h3>
            </div>

            <div
              role="tablist"
              aria-label="Fragrance Note Tiers"
              className="inline-flex items-center gap-6 self-start"
            >
              {NOTE_TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  role="tab"
                  aria-selected={activeTier === tier}
                  onClick={() => {
                    setActiveTier(tier);
                    const firstInTier = OLFACTIVE_NOTES_LIBRARY.find((n) => n.tier === tier);
                    if (firstInTier) setSelectedNote(firstInTier);
                  }}
                  className={`pb-2 text-[11px] tracking-[0.18em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                    activeTier === tier
                      ? 'border-[#9A7B4F] dark:border-[#C8A97E] text-[#161412] dark:text-[#F4F0EA] font-medium'
                      : 'border-transparent text-[#7A7269] dark:text-[#A39C93] hover:text-[#161412] dark:hover:text-[#F4F0EA]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
            {/* Interactive Ingredient Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tierNotes.map((note) => {
                const isSelected = selectedNote.name === note.name;
                return (
                  <button
                    key={note.name}
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className={`text-left p-5 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#9A7B4F] dark:border-[#C8A97E] bg-[#F7F4EE] dark:bg-[#1B1815]'
                        : 'border-[#EAE3D8] dark:border-[#2B2723] hover:border-[#9A7B4F]/60 dark:hover:border-[#C8A97E]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#7A7269] dark:text-[#A39C93] mb-2">
                      <span>{note.family}</span>
                      <span>{note.tier}</span>
                    </div>
                    <p className="font-editorial text-2xl mb-1">{note.name}</p>
                    <p className="font-editorial italic text-xs text-[#6B655E] dark:text-[#A39C93] truncate">
                      {note.origin}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Note Detail + Paired Fragrances */}
            <div className="lg:col-span-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E5DFD5] dark:border-[#2B2723] pt-8 lg:pt-0 lg:pl-10">
              <div>
                <div className="flex items-center gap-3 text-xs tracking-[0.14em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                  <span>{selectedNote.tier}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedNote.origin}</span>
                </div>
                <h4 className="font-editorial text-3xl sm:text-4xl mb-3">
                  {selectedNote.name}
                </h4>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed mb-6">
                  {selectedNote.profile}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectNoteFilter(selectedNote.name)}
                  className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase border-b border-current pb-1 hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors mb-8 cursor-pointer"
                >
                  <span>Filter Catalog by {selectedNote.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-[#6B655E] dark:text-[#A39C93] mb-3">
                  Creations Featuring {selectedNote.name} ({matchingPerfumes.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingPerfumes.slice(0, 4).map((perfume) => (
                    <button
                      key={perfume.id}
                      type="button"
                      onClick={() => onViewProduct(perfume)}
                      className="flex items-center gap-3 p-2.5 border border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F] dark:hover:border-[#C8A97E] transition-colors text-left cursor-pointer"
                    >
                      <img
                        src={perfume.images[0]}
                        alt={perfume.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 object-cover shrink-0 bg-[#EFEAE2] dark:bg-[#1E1B18]"
                      />
                      <div className="min-w-0">
                        <p className="font-editorial text-base truncate">{perfume.name}</p>
                        <p className="text-xs text-[#6B655E] dark:text-[#A39C93] tabular-nums">
                          {perfume.concentration} · ${perfume.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
