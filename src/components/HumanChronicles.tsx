import React, { useState } from 'react';
import { ArrowRight, BookOpen, Quote, Send } from 'lucide-react';
import { HUMAN_CHRONICLES, HumanChronicle } from '../data/perfumes';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface HumanChroniclesProps {
  products: PerfumeProduct[];
  onViewProduct: (product: PerfumeProduct) => void;
}

export const HumanChronicles: React.FC<HumanChroniclesProps> = ({
  products,
  onViewProduct,
}) => {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [submittedStory, setSubmittedStory] = useState(false);
  const [userStoryText, setUserStoryText] = useState('');
  const [userCity, setUserCity] = useState('');

  const activeChronicle: HumanChronicle = HUMAN_CHRONICLES[activeStoryIdx] || HUMAN_CHRONICLES[0];
  const matchedProduct = products.find((p) => p.id === activeChronicle.scentId);

  const handleSelectStory = (idx: number) => {
    setActiveStoryIdx(idx);
    atelierAudio.playChime(660, 0.1);
  };

  const handleShareStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStoryText.trim()) return;
    setSubmittedStory(true);
    atelierAudio.playChime(880, 0.15);
  };

  return (
    <section
      id="chronicles"
      className="py-24 lg:py-32 px-6 lg:px-10 bg-[#FAF8F5] dark:bg-[#12100E] border-t border-[#E5DFD5] dark:border-[#2B2723]"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
              Les Récits Humains · True Life Memoirs
            </p>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl text-balance mb-4 leading-[1.08]">
            Life written in <span className="italic font-normal text-[#9A7B4F] dark:text-[#C8A97E]">scent.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
            Every bottle of Maison Léonie has quietly witnessed the defining turning points of human
            lives: weddings on Italian cliffs, courage in concert halls, and love that never faded.
          </p>
        </div>

        {/* Stories Tabs & Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Story Nav Cards */}
          <div className="lg:col-span-5 space-y-4">
            {HUMAN_CHRONICLES.map((chronicle, idx) => {
              const isActive = idx === activeStoryIdx;
              return (
                <button
                  key={chronicle.id}
                  type="button"
                  onClick={() => handleSelectStory(idx)}
                  className={`w-full p-6 text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#9A7B4F] dark:border-[#C8A97E] bg-[#FFFFFF] dark:bg-[#1A1714] shadow-md'
                      : 'border-[#E5DFD5] dark:border-[#26221E] bg-[#FFFFFF]/70 dark:bg-[#151311] hover:border-[#9A7B4F]/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#8C847A] mb-2">
                    <span className="uppercase tracking-[0.18em]">
                      {chronicle.author} · {chronicle.city}
                    </span>
                    <span className="font-editorial text-sm text-[#9A7B4F] dark:text-[#C8A97E]">
                      {chronicle.year}
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl sm:text-2xl mb-2 text-[#161412] dark:text-[#FAF8F5]">
                    {chronicle.title}
                  </h3>
                  <p className="text-xs text-[#6B655E] dark:text-[#A39C93] line-clamp-2">
                    &ldquo;{chronicle.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#EAE3D8] dark:border-[#24201D] flex items-center justify-between text-[11px] text-[#9A7B4F] dark:text-[#C8A97E]">
                    <span>Scent worn: {chronicle.scentWorn}</span>
                    <span className="underline">Read Memoir</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Story Detail */}
          <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#161412] border border-[#E5DFD5] dark:border-[#2B2723] p-8 sm:p-12 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Quote className="w-8 h-8 text-[#C8A97E]/70 shrink-0" />
              <div>
                <p className="font-editorial text-2xl sm:text-3xl italic text-[#161412] dark:text-[#FAF8F5]">
                  &ldquo;{activeChronicle.quote}&rdquo;
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] mt-2">
                  — {activeChronicle.author}, {activeChronicle.profession} ({activeChronicle.city})
                </p>
              </div>
            </div>

            <div className="h-px bg-[#E5DFD5] dark:bg-[#2B2723]" />

            <p className="text-sm sm:text-base leading-relaxed text-[#554E46] dark:text-[#D4CDC3]">
              {activeChronicle.story}
            </p>

            <div className="p-5 bg-[#FAF8F5] dark:bg-[#1C1916] border border-[#E5DFD5] dark:border-[#2B2723] flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C847A]">
                  The Fragrance of This Memory
                </p>
                <p className="font-editorial text-xl text-[#161412] dark:text-[#FAF8F5]">
                  {activeChronicle.scentWorn}
                </p>
              </div>
              {matchedProduct && (
                <button
                  type="button"
                  onClick={() => onViewProduct(matchedProduct)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#161412] text-[#FAF8F5] dark:bg-[#E4C79B] dark:text-[#0E0D0C] text-xs uppercase tracking-[0.16em] hover:bg-[#9A7B4F] transition-colors cursor-pointer"
                >
                  <span>Experience {matchedProduct.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Life Story Submission */}
            <div className="pt-6 border-t border-[#EAE3D8] dark:border-[#26221E]">
              {!submittedStory ? (
                <form onSubmit={handleShareStory} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#9A7B4F] dark:text-[#C8A97E]" />
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#C8A97E] font-medium">
                      Add Your Chapter to the Maison Archive
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                      placeholder="Your City (e.g. Florence, New York, Tokyo)"
                      className="bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-3.5 py-2 text-xs text-[#161412] dark:text-[#FAF8F5] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={userStoryText}
                      onChange={(e) => setUserStoryText(e.target.value)}
                      placeholder="In one sentence, how did perfume touch your life?"
                      className="bg-[#FAF8F5] dark:bg-[#110F0E] border border-[#DCD5CB] dark:border-[#38322B] px-3.5 py-2 text-xs text-[#161412] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#9A7B4F] dark:border-[#C8A97E] text-[10px] uppercase tracking-[0.18em] text-[#9A7B4F] dark:text-[#E4C79B] hover:bg-[#9A7B4F] hover:text-white dark:hover:bg-[#E4C79B] dark:hover:text-[#0E0D0C] transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit to Curator</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-[#F2EDE4] dark:bg-[#1E1B18] text-xs text-[#554E46] dark:text-[#C8A97E] tracking-wide">
                  Thank you. Your memory has been inscribed into our private archive.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
