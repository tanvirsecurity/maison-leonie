import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { computeQuizRecommendations, QuizRecommendation } from '../lib/recommendations';
import { FragranceFamily, IntensityLevel, PerfumeProduct, QuizAnswers } from '../types/perfume';

interface FragranceQuizProps {
  products: PerfumeProduct[];
  onAddToCart: (product: PerfumeProduct) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onSaveQuizProfile?: (answers: QuizAnswers, summary: string) => void;
}

const FAMILIES: FragranceFamily[] = ['Floral', 'Woody', 'Oriental', 'Fresh', 'Citrus', 'Gourmand'];
const LIFESTYLES = [
  'Architectural Minimalist',
  'Evening Collector & Patron',
  'Sunlit Coastal Nomad',
  'Classic Romantic',
];
const NOTE_OPTIONS = [
  'Bergamot',
  'Jasmine',
  'Rose',
  'Iris',
  'Neroli',
  'Saffron',
  'Vanilla',
  'Sandalwood',
  'Amber',
  'Musk',
];

export const FragranceQuiz: React.FC<FragranceQuizProps> = ({
  products,
  onAddToCart,
  onViewProduct,
  onSaveQuizProfile,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    families: ['Oriental'],
    lifestyle: 'Evening Collector & Patron',
    notes: ['Amber', 'Jasmine'],
    intensity: 'Moderate',
    timeOfDay: 'Evening',
    season: 'Autumn',
  });
  const [results, setResults] = useState<QuizRecommendation[] | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleFamily = (fam: FragranceFamily) => {
    setAnswers((prev) => {
      const exists = prev.families.includes(fam);
      if (exists && prev.families.length === 1) return prev;
      return {
        ...prev,
        families: exists
          ? prev.families.filter((f) => f !== fam)
          : [...prev.families, fam].slice(0, 3),
      };
    });
  };

  const toggleNote = (note: string) => {
    setAnswers((prev) => {
      const exists = prev.notes.includes(note);
      if (exists && prev.notes.length === 1) return prev;
      return {
        ...prev,
        notes: exists ? prev.notes.filter((n) => n !== note) : [...prev.notes, note].slice(0, 4),
      };
    });
  };

  const handleComplete = () => {
    const recs = computeQuizRecommendations(products, answers);
    setResults(recs);
    if (onSaveQuizProfile) {
      const summary = `${answers.families.join('/')} · ${answers.intensity} · ${answers.notes.slice(0, 3).join(', ')}`;
      onSaveQuizProfile(answers, summary);
      setSavedNotice(true);
    }
  };

  const resetQuiz = () => {
    setResults(null);
    setStep(0);
    setSavedNotice(false);
  };

  return (
    <section
      id="quiz"
      className="py-24 lg:py-32 px-6 lg:px-10 border-t border-[#E5DFD5] dark:border-[#2B2723] bg-[#F2EEE8]/50 dark:bg-[#141210]"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-[1px] w-6 bg-[#9A7B4F] dark:bg-[#C8A97E]" aria-hidden="true" />
            <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
              Consultation Privée
            </p>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl text-balance mb-4 leading-[1.08]">
            Personalized <span className="italic font-normal">Fragrance</span> Profiling
          </h2>
          <p className="text-sm sm:text-base text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
            Six considered questions composed by our Grasse perfumers to align your wardrobe,
            atmosphere, and skin chemistry with your signature Maison Léonie extrait.
          </p>
        </div>

        {!results ? (
          <div className="border border-[#EAE3D8] dark:border-[#2B2723] bg-[#FFFFFF]/90 dark:bg-[#171513] p-6 sm:p-10 lg:p-14">
            <div className="pb-6 mb-8 border-b border-[#E5DFD5] dark:border-[#2B2723]">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#7A7269] dark:text-[#A39C93] mb-3">
                <span className="font-editorial italic text-sm normal-case text-[#9A7B4F] dark:text-[#C8A97E]">
                  Question {['I', 'II', 'III', 'IV', 'V', 'VI'][step]} of VI
                </span>
                <span>Olfactive Consultation</span>
              </div>
              <div className="w-full h-[1px] bg-[#E5DFD5] dark:bg-[#2B2723] overflow-hidden">
                <div
                  className="h-full bg-[#9A7B4F] dark:bg-[#C8A97E] transition-all duration-300"
                  style={{ width: `${((step + 1) / 6) * 100}%` }}
                />
              </div>
            </div>

            {step === 0 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  Which olfactive families draw you in naturally?
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  Select up to three families.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FAMILIES.map((fam) => {
                    const active = answers.families.includes(fam);
                    return (
                      <button
                        key={fam}
                        type="button"
                        onClick={() => toggleFamily(fam)}
                        className={`p-4 text-left border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                            : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                        }`}
                      >
                        <span className="font-editorial text-xl block">{fam}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  Which persona best describes your daily rhythm?
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  Choose the atmosphere you gravitate toward most.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LIFESTYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, lifestyle: style }))}
                      className={`p-5 text-left border transition-colors cursor-pointer ${
                        answers.lifestyle === style
                          ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                      }`}
                    >
                      <span className="font-editorial text-xl block">{style}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  Select your favorite raw scent ingredients
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  Choose up to four botanical or resinous notes.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {NOTE_OPTIONS.map((note) => {
                    const active = answers.notes.includes(note);
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => toggleNote(note)}
                        className={`py-3.5 px-4 text-center border text-sm transition-colors cursor-pointer ${
                          active
                            ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                            : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                        }`}
                      >
                        {note}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  What sillage intensity &amp; longevity do you prefer?
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  From skin-close whispers to twelve-hour architectural presence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        val: 'Intimate',
                        desc: 'Close to skin · 6–8 hours · Eau de Toilette clarity',
                      },
                      {
                        val: 'Moderate',
                        desc: 'Balanced aura · 10–12 hours · Eau de Parfum poise',
                      },
                      {
                        val: 'Statement',
                        desc: 'Commanding trail · 14+ hours · Extrait de Parfum',
                      },
                    ] as Array<{ val: IntensityLevel; desc: string }>
                  ).map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, intensity: opt.val }))}
                      className={`p-5 text-left border transition-colors cursor-pointer ${
                        answers.intensity === opt.val
                          ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                      }`}
                    >
                      <span className="font-editorial text-2xl block mb-1">{opt.val}</span>
                      <span className="text-xs opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  When will you reach for this fragrance most?
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  Daylight luminosity, nocturnal depth, or seamless versatility.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['Daytime', 'Evening', 'Versatile'] as const).map((tod) => (
                    <button
                      key={tod}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, timeOfDay: tod }))}
                      className={`p-5 text-left border transition-colors cursor-pointer ${
                        answers.timeOfDay === tod
                          ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                      }`}
                    >
                      <span className="font-editorial text-2xl block">{tod}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl mb-2">
                  Which season sets the mood for your signature?
                </h3>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6">
                  Temperature shapes how top and base notes bloom on skin.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((season) => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, season }))}
                      className={`p-5 text-left border transition-colors cursor-pointer ${
                        answers.season === season
                          ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                      }`}
                    >
                      <span className="font-editorial text-2xl block">{season}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-8 mt-10 border-t border-[#E5DFD5] dark:border-[#2B2723]">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Previous</span>
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs tracking-[0.16em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-7 py-3 text-xs tracking-[0.16em] uppercase bg-[#9A7B4F] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                >
                  <span>Reveal Your Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FFFFFF] dark:bg-[#171513] border border-[#E5DFD5] dark:border-[#2B2723]">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-[#9A7B4F] dark:text-[#C8A97E] mb-1">
                  Your Bespoke Olfactive Dossier
                </p>
                <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                  {answers.families.join(' / ')} · {answers.intensity} projection ·{' '}
                  {answers.notes.join(', ')} · {answers.season}
                </p>
                {savedNotice && (
                  <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E] mt-1 inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to your client profile for tailored recommendations</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retake Quiz</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.map((rec, idx) => (
                <article
                  key={rec.product.id}
                  className="flex flex-col justify-between bg-[#FFFFFF] dark:bg-[#171513] border border-[#E5DFD5] dark:border-[#2B2723]"
                >
                  <div>
                    <div
                      onClick={() => onViewProduct(rec.product)}
                      className="aspect-[4/3] overflow-hidden bg-[#EFEAE2] dark:bg-[#1E1B18] cursor-pointer"
                    >
                      <img
                        src={rec.product.images[0]}
                        alt={rec.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[#9A7B4F] dark:text-[#C8A97E] mb-2">
                        <span>Match #{idx + 1}</span>
                        <span className="tabular-nums">{rec.matchPercent}% Affinity</span>
                      </div>
                      <h3 className="font-editorial text-2xl mb-1">{rec.product.name}</h3>
                      <p className="text-xs text-[#6B655E] dark:text-[#A39C93] mb-3 tabular-nums">
                        {rec.product.concentration} · ${rec.product.price}
                      </p>
                      <p className="text-sm text-[#3A3530] dark:text-[#D5CEC4] leading-relaxed">
                        {rec.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onAddToCart(rec.product)}
                      disabled={rec.product.stockCount <= 0}
                      className="flex-1 py-2.5 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer disabled:opacity-50"
                    >
                      {rec.product.stockCount > 0 ? 'Add to Bag' : 'Out of Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewProduct(rec.product)}
                      className="px-4 py-2.5 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] cursor-pointer"
                    >
                      Notes
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
