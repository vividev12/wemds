import React from 'react';
import { ArrowDownRight, Plus, Settings, LogOut } from 'lucide-react';
import { ShinyButton } from './shiny-button';

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
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenAddModal?: () => void;
  onOpenSettings?: () => void;
  onLogoutAdmin?: () => void;
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
  isAdmin = false,
  onOpenAdminLogin,
  onOpenAddModal,
  onOpenSettings,
  onLogoutAdmin,
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
      className="hero-viewport-shell relative w-full overflow-x-clip bg-[#080808] border-b border-[#222222] flex flex-col justify-evenly gap-6 sm:gap-8 pt-10 pb-2 sm:pt-12 sm:pb-4"
    >
      {/* Ícone flutuante discreto no canto superior direito da Hero (sem barra/cabeçalho) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40">
        {isAdmin ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808] font-bold text-xs px-3 py-2 rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap shadow-[0_4px_16px_rgba(255,212,0,0.25)]"
                title="Cadastrar nova referência fotográfica e prompt"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Adicionar</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-[#323232] hover:border-[#FFD400] bg-[#151515]/90 hover:bg-[#202020] text-white transition-colors duration-200 cursor-pointer"
                title="Configurações, Nuvem e Backup"
                aria-label="Configurações, Nuvem e Backup"
              >
                <Settings className="w-4 h-4 text-[#FFD400] stroke-[2]" />
              </button>
            )}
            {onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-2 rounded-xl border border-[#323232] hover:border-red-500/70 bg-[#151515]/90 hover:bg-[#241414] text-[#B5B5B5] hover:text-red-300 transition-colors duration-200 cursor-pointer"
                title="Sair do modo administrador"
                aria-label="Sair do modo administrador"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            )}
          </div>
        ) : (
          onOpenAdminLogin && (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              title="Acesso administrativo"
              aria-label="Acesso administrativo"
              className="p-1.5 bg-transparent border-0 inline-flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-80 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded-lg"
            >
              <img
                src="/account-icon-yellow.png"
                alt="Acesso administrativo"
                width={22}
                height={22}
                draggable={false}
                className="w-[22px] h-[22px] object-contain pointer-events-none select-none"
              />
            </button>
          )
        )}
      </div>

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

        {/* 4. Botão Shiny Black & Gold ACESSAR CATÁLOGO acima da galeria */}
        <div className="mt-5 sm:mt-6 flex justify-center relative z-30">
          <ShinyButton onClick={onCtaClick}>
            <span>{ctaText}</span>
            <ArrowDownRight className="w-5 h-5 text-[#FFD400] stroke-[2.5] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </ShinyButton>
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
