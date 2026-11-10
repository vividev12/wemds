import React from 'react';
import { ArrowDownRight } from 'lucide-react';

export interface MarqueeHeroImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export interface AnimatedMarqueeHeroProps {
  brandBadge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
  images: MarqueeHeroImage[];
}

const CARD_COMPOSITIONS = [
  { rotate: '-rotate-2', offset: 'translate-y-0' },
  { rotate: 'rotate-2', offset: 'translate-y-3 sm:translate-y-5' },
  { rotate: '-rotate-1', offset: '-translate-y-1 sm:-translate-y-2' },
  { rotate: 'rotate-1', offset: 'translate-y-2 sm:translate-y-3' },
  { rotate: '-rotate-2', offset: 'translate-y-0' },
  { rotate: 'rotate-2', offset: 'translate-y-3 sm:translate-y-5' },
  { rotate: '-rotate-1', offset: '-translate-y-1 sm:-translate-y-2' },
  { rotate: 'rotate-1', offset: 'translate-y-2 sm:translate-y-3' },
];

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  brandBadge,
  title,
  subtitle,
  ctaText,
  onCtaClick,
  images,
}) => {
  const renderCardGroup = (prefix: string, isClone = false) => (
    <div className="hero-marquee-group" aria-hidden={isClone || undefined}>
      {images.map((item, idx) => {
        const comp = CARD_COMPOSITIONS[idx % CARD_COMPOSITIONS.length];
        return (
          <div
            key={`${prefix}-${item.id}-${idx}`}
            className={`relative w-[204px] sm:w-[220px] lg:w-[244px] aspect-[3/4] shrink-0 rounded-2xl overflow-hidden bg-[#151515] border border-[#2C2C2C] shadow-[0_18px_36px_-12px_rgba(0,0,0,0.85)] ${comp.rotate} ${comp.offset}`}
          >
            <img
              src={item.src}
              alt={isClone ? '' : item.alt}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              draggable={false}
              className="w-full h-full object-cover object-[50%_15%] select-none"
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      aria-label="Apresentação do Catálogo We Media"
      className="hero-viewport-shell relative w-full overflow-x-clip bg-[#080808] border-b border-[#222222] flex flex-col justify-evenly gap-6 sm:gap-8 pt-6 pb-0 sm:pt-8 sm:pb-2"
    >
      {/* Brilho ambiente sutil no topo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(255,212,0,0.08),transparent_72%)]"
      />

      {/* Camada Superior: Copy compacta + Botão CTA acima da galeria */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-center shrink-0">
        {/* 1. Assinatura Visual Amarela WeMedia */}
        <div className="inline-flex items-center justify-center">
          <span className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#FFD400] text-[#080808] font-brand font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_6px_20px_rgba(255,212,0,0.3)]">
            {brandBadge}
          </span>
        </div>

        {/* 2. Título Curto e Direto */}
        <h2 className="mt-3 sm:mt-4 font-display text-[32px] leading-[1.06] sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white text-balance">
          {title}
        </h2>

        {/* 3. Subtítulo Objetivo */}
        <p className="mt-2.5 sm:mt-3.5 text-sm sm:text-base lg:text-lg font-medium text-[#D6D6D6] max-w-md sm:max-w-xl mx-auto leading-snug sm:leading-relaxed">
          {subtitle}
        </p>

        {/* 4. Botão Amarelo ACESSAR CATÁLOGO acima da galeria */}
        <div className="mt-4 sm:mt-6 flex justify-center relative z-30">
          <button
            type="button"
            onClick={onCtaClick}
            className="min-h-[48px] sm:min-h-[54px] px-7 sm:px-9 py-3 sm:py-3.5 rounded-xl bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808] font-extrabold text-sm sm:text-base uppercase tracking-wider inline-flex items-center justify-center gap-2.5 cursor-pointer transition-colors duration-200 shadow-[0_12px_32px_rgba(8,8,8,0.92),0_6px_24px_rgba(255,212,0,0.38)] hover:shadow-[0_12px_32px_rgba(8,8,8,0.95),0_10px_32px_rgba(255,212,0,0.52)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>{ctaText}</span>
            <ArrowDownRight className="w-5 h-5 stroke-[2.5] shrink-0" />
          </button>
        </div>
      </div>

      {/* Camada Inferior: Galeria Marquee posicionada abaixo do botão, sem sobreposição */}
      <div className="relative z-10 w-full">
        {/* Gradientes sutis apenas nas extremidades laterais para entrada/saída suave sem escurecer as fotos */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-14 lg:w-28 bg-gradient-to-r from-[#080808] to-transparent z-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-14 lg:w-28 bg-gradient-to-l from-[#080808] to-transparent z-20"
        />

        {/* Marquee Infinito Real via CSS Keyframes (esquerda -> direita) */}
        <div className="hero-marquee">
          <div className="hero-marquee-track">
            {renderCardGroup('primary', false)}
            {renderCardGroup('clone', true)}
          </div>
        </div>
      </div>
    </section>
  );
};
