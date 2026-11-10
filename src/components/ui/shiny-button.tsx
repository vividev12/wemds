import React from 'react';

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      {...props}
      className={`group relative inline-flex items-center justify-center rounded-full p-[2px] overflow-hidden cursor-pointer select-none transition-all duration-300 shadow-[0_0_20px_rgba(255,212,0,0.32),0_0_42px_rgba(255,212,0,0.14),0_12px_28px_rgba(0,0,0,0.88)] hover:shadow-[0_0_28px_rgba(255,212,0,0.52),0_0_56px_rgba(255,212,0,0.22),0_14px_32px_rgba(0,0,0,0.92)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ${className}`}
    >
      {/* Camada 1: Feixe luminoso dourado girando em sentido horário ao redor da cápsula */}
      <span
        aria-hidden="true"
        className="shiny-btn-beam pointer-events-none absolute left-1/2 top-1/2 w-[340%] aspect-square opacity-95 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(255,212,0,0.26) 0deg, rgba(255,212,0,0.28) 210deg, #FFD400 278deg, #FFEA00 310deg, #FFF7B2 328deg, #FFD400 344deg, rgba(255,212,0,0.26) 360deg)',
        }}
      />

      {/* Camada 2: Corpo preto profundo (#050505 / #111111) + reflexo dourado interno sutil */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5 w-full h-full rounded-full bg-gradient-to-b from-[#151515] via-[#0B0B0B] to-[#050505] group-hover:from-[#1B1B1B] group-hover:via-[#111111] group-hover:to-[#070707] px-7 sm:px-9 min-h-[48px] sm:min-h-[54px] overflow-hidden shadow-[inset_0_1px_0_rgba(255,234,0,0.26),inset_0_-1px_0_rgba(255,212,0,0.14)] transition-colors duration-300">
        {/* Reflexo energético sutil circulando internamente sem prejudicar leitura */}
        <span
          aria-hidden="true"
          className="shiny-btn-sheen pointer-events-none absolute left-1/2 top-1/2 w-[260%] aspect-square opacity-25 group-hover:opacity-40 transition-opacity duration-300"
          style={{
            background:
              'conic-gradient(from 90deg, transparent 0deg, transparent 275deg, rgba(255,212,0,0.45) 318deg, rgba(255,234,0,0.65) 334deg, transparent 360deg)',
          }}
        />

        {/* Conteúdo nítido e centralizado */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2.5 font-display font-bold text-sm sm:text-base uppercase tracking-[0.08em] text-white whitespace-nowrap">
          {children}
        </span>
      </span>
    </button>
  );
};
