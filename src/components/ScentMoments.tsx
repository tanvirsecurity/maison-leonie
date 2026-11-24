import { getAssetUrl } from '../lib/assets';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FragranceFamily } from '../types/perfume';

interface ScentMomentsProps {
  onChooseFamily: (family: FragranceFamily) => void;
}

const MOMENTS: Array<{
  time: string;
  title: string;
  description: string;
  family: FragranceFamily;
  image: string;
  imageAlt: string;
}> = [
  {
    time: 'FIRST LIGHT',
    title: 'A beginning, all your own.',
    description: 'Bright citrus and green neroli for the quiet breath before the day finds you.',
    family: 'Citrus',
    image: getAssetUrl('/src/assets/images/bottle_neroli_soleil_1795464160313.jpg'),
    imageAlt: 'Golden neroli perfume catching the morning light',
  },
  {
    time: 'BETWEEN EVERYTHING',
    title: 'A small return to yourself.',
    description: 'Soft iris and petals make a private pause in the middle of an ordinary day.',
    family: 'Floral',
    image: getAssetUrl('/src/assets/images/bottle_iris_blanc_1795464159068.jpg'),
    imageAlt: 'Iris fragrance in a softly lit still life',
  },
  {
    time: 'AFTER DUSK',
    title: 'The warmth you carry home.',
    description: 'Amber and woods hold the afterglow of a room you did not want to leave.',
    family: 'Oriental',
    image: getAssetUrl('/src/assets/images/bottle_oud_velours_1795464159199.jpg'),
    imageAlt: 'An amber oud fragrance in evening light',
  },
];

export const ScentMoments: React.FC<ScentMomentsProps> = ({ onChooseFamily }) => (
  <section id="scent-moments" className="bg-[#F3EEE6] px-6 py-24 lg:px-10 lg:py-32">
    <div className="mx-auto max-w-[1360px]">
      <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-7 bg-[#9A7B4F]" aria-hidden="true" />
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9A7B4F]">
              A fragrance for the life you&apos;re living
            </p>
          </div>
          <h2 className="max-w-3xl font-editorial text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Life leaves a trace.
            <span className="block italic text-[#9A7B4F]">Let it be yours.</span>
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-[#625B53] lg:col-span-5 lg:justify-self-end">
          A scent can bring you back to the breath before the door opens, the pause you made for
          yourself, the evening you wished would last. Find the notes that feel like your life.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
        {MOMENTS.map((moment, index) => (
          <article
            key={moment.family}
            className="group relative isolate min-h-[460px] overflow-hidden bg-[#211C18] text-[#FAF8F5] sm:min-h-[520px]"
          >
            <img
              src={moment.image}
              alt={moment.imageAlt}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#100E0C]/95 via-[#100E0C]/30 to-[#100E0C]/10"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[10px] uppercase tracking-[0.2em] text-white/85 sm:p-7">
              <span>{moment.time}</span>
              <span>0{index + 1} / 03</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#E4C79B]">
                {moment.family} · {moment.time.toLowerCase()}
              </p>
              <h3 className="mb-3 max-w-sm font-editorial text-3xl leading-tight sm:text-4xl">
                {moment.title}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-white/80">
                {moment.description}
              </p>
              <button
                type="button"
                onClick={() => onChooseFamily(moment.family)}
                className="mt-7 inline-flex items-center gap-2 border-b border-[#E4C79B]/70 pb-1 text-[10px] uppercase tracking-[0.2em] text-[#F2D8B5] transition-colors hover:border-white hover:text-white"
              >
                Explore {moment.family}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center font-editorial text-lg italic text-[#625B53]">
        Not for an occasion. For the way you want to feel inside it.
      </p>
    </div>
  </section>
);
