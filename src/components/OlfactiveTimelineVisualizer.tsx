import React, { useState } from 'react';
import {
  Clock,
  Compass,
  Droplets,
  Flame,
  Radio,
  Sliders,
  Sparkles,
  Wind,
} from 'lucide-react';
import { PerfumeProduct } from '../types/perfume';
import { atelierAudio } from '../lib/audioAtmosphere';

interface OlfactiveTimelineVisualizerProps {
  product: PerfumeProduct;
}

interface TimelineStage {
  hour: number;
  label: string;
  phaseTitle: string;
  dominantNotes: string[];
  sillageRadius: string;
  skinTempInteraction: string;
  poeticImpression: string;
  glowColor: string;
  cloudScale: number;
}

export const OlfactiveTimelineVisualizer: React.FC<OlfactiveTimelineVisualizerProps> = ({
  product,
}) => {
  const [activeStageIdx, setActiveStageIdx] = useState(1);

  // Dynamic stages tailored to the product's note pyramid
  const stages: TimelineStage[] = [
    {
      hour: 0,
      label: 'Minute 0 · Opening Mist',
      phaseTitle: "L'Éveil Luminous",
      dominantNotes: product.topNotes.slice(0, 3),
      sillageRadius: '6.5 Feet (Statement Room Radiance)',
      skinTempInteraction: 'Volatile citrus esters and cold-pressed bergamot sparkle in ambient air.',
      poeticImpression: 'A bright, crisp breath of pure morning light on cold silk before the day begins.',
      glowColor: 'from-[#E4C79B]/30 via-[#C8A97E]/15 to-transparent',
      cloudScale: 1.35,
    },
    {
      hour: 2,
      label: 'Hour 2 · Heart Bloom',
      phaseTitle: 'Le Cœur Épanoui',
      dominantNotes: product.heartNotes.slice(0, 3),
      sillageRadius: '4.2 Feet (Arm’s Length Presence)',
      skinTempInteraction: 'Body heat unlocks delicate floral absolutes and buttery Florentine orris.',
      poeticImpression: 'The perfume transitions from air into skin. Suede-soft, intimate, and deeply composed.',
      glowColor: 'from-[#C8A97E]/35 via-[#9A7B4F]/20 to-transparent',
      cloudScale: 1.15,
    },
    {
      hour: 6,
      label: 'Hour 6 · Intimate Resonance',
      phaseTitle: 'La Présence Intime',
      dominantNotes: [product.heartNotes[0] || 'Rose', ...product.baseNotes.slice(0, 2)],
      sillageRadius: '2.4 Feet (Personal Conversation Halo)',
      skinTempInteraction: 'Dry cedarwood and amber resins anchor onto pulse points and collarbones.',
      poeticImpression: 'Noticeable only to those welcomed into your private physical space.',
      glowColor: 'from-[#9A7B4F]/40 via-[#6B502C]/20 to-transparent',
      cloudScale: 0.9,
    },
    {
      hour: 14,
      label: `Hour ${product.longevityHours || 14} · Sostenuto Drydown`,
      phaseTitle: 'Le Sillage Nocturne',
      dominantNotes: product.baseNotes.slice(0, 3),
      sillageRadius: '1.2 Feet (Intimate Second-Skin)',
      skinTempInteraction: 'Dark Madagascar bourbon vanilla pod and Mysore sandalwood fuse with your natural sebum.',
      poeticImpression: 'Warm amber carried home on a coat lapel long after midnight. The memory that endures.',
      glowColor: 'from-[#6B502C]/45 via-[#3D2C17]/25 to-transparent',
      cloudScale: 0.75,
    },
  ];

  const currentStage = stages[activeStageIdx];

  const handleSelectStage = (idx: number) => {
    setActiveStageIdx(idx);
    const chimeFreqs = [528, 594, 660, 740];
    atelierAudio.playChime(chimeFreqs[idx] || 528, 0.12);
  };

  return (
    <div className="p-6 sm:p-8 bg-[#12100E] text-[#FAF8F5] border border-[#2B2723] space-y-8 relative overflow-hidden">
      {/* Dynamic Olfactive Aura Glow in Background */}
      <div
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 bg-gradient-to-r ${currentStage.glowColor}`}
        style={{ transform: `translate(-50%, -50%) scale(${currentStage.cloudScale})` }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2B2723]">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#E4C79B] font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Architecture Olfactive · 14-Hour Skin Evolution</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl">
            How {product.name} evolves across your day
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#C8A97E] font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Interactive Time Scrubber</span>
        </div>
      </div>

      {/* Interactive Time Slider / Stage Buttons */}
      <div className="relative z-10 space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {stages.map((stage, idx) => {
            const isSelected = idx === activeStageIdx;
            return (
              <button
                key={stage.hour}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`py-3 px-2 border transition-all cursor-pointer text-center relative ${
                  isSelected
                    ? 'border-[#E4C79B] bg-[#E4C79B] text-black font-semibold shadow-lg'
                    : 'border-[#2B2723] bg-[#161412] text-[#A39C93] hover:border-[#C8A97E] hover:text-white'
                }`}
              >
                <span className="block font-mono text-xs sm:text-sm">{stage.hour}h</span>
                <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider truncate mt-0.5">
                  {stage.phaseTitle}
                </span>
                {isSelected && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#E4C79B] rotate-45" />
                )}
              </button>
            );
          })}
        </div>

        {/* Timeline Progress Bar */}
        <div className="h-1 bg-[#24201C] relative rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C8A97E] to-[#E4C79B] transition-all duration-500 rounded-full"
            style={{ width: `${((activeStageIdx + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Active Stage Insights Matrix */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#171513]/90 border border-[#2B2723] p-6 sm:p-8 backdrop-blur-sm">
        {/* Left Column: Poetic Experience & Active Notes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.24em] px-2.5 py-0.5 bg-[#2B2723] text-[#E4C79B] font-semibold">
              {currentStage.label}
            </span>
            <span className="font-editorial italic text-lg text-[#C8A97E]">
              &ldquo;{currentStage.phaseTitle}&rdquo;
            </span>
          </div>

          <p className="font-editorial text-xl sm:text-2xl text-white leading-relaxed">
            {currentStage.poeticImpression}
          </p>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C847A] block font-medium">
              Dominant Active Notes at this Hour:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentStage.dominantNotes.map((note) => (
                <span
                  key={note}
                  className="px-3 py-1 bg-[#221F1B] border border-[#E4C79B]/40 text-xs text-[#FAF8F5] uppercase tracking-wider"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Physical Performance Metrics */}
        <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-[#2B2723] pt-6 lg:pt-0 lg:pl-8 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#C8A97E] text-[10px] uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5" />
              <span>Sillage Projection Radius</span>
            </div>
            <p className="font-medium text-white">{currentStage.sillageRadius}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#C8A97E] text-[10px] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Skin Chemistry &amp; Temperature Interaction</span>
            </div>
            <p className="text-[#A39C93] leading-relaxed">{currentStage.skinTempInteraction}</p>
          </div>

          <div className="pt-2 text-[11px] text-[#8C847A] flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Pure Extrait 32% concentration delivers continuous drydown without ethanol evaporation spikes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
