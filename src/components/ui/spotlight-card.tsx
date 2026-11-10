import React, { useCallback, useEffect, useRef } from 'react';

export type SpotlightColor = 'blue' | 'purple' | 'green' | 'red' | 'orange';

export const SPOTLIGHT_COLORS: readonly SpotlightColor[] = [
  'blue',
  'purple',
  'green',
  'red',
  'orange',
] as const;

const SPOTLIGHT_HSL_MAP: Record<SpotlightColor, string> = {
  blue: '217 91% 62%',
  purple: '270 86% 66%',
  green: '152 76% 52%',
  red: '352 88% 62%',
  orange: '28 96% 58%',
};

export interface GlowCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: SpotlightColor;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingCoordsRef = useRef<{ x: number; y: number } | null>(null);

  const flushCoords = useCallback(() => {
    rafRef.current = null;
    const node = cardRef.current;
    const coords = pendingCoordsRef.current;
    if (!node || !coords) return;

    node.style.setProperty('--spot-x', `${coords.x}px`);
    node.style.setProperty('--spot-y', `${coords.y}px`);
  }, []);

  const updatePointerCoords = useCallback(
    (clientX: number, clientY: number) => {
      const node = cardRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      pendingCoordsRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(flushCoords);
      }
    },
    [flushCoords]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      updatePointerCoords(e.clientX, e.clientY);
    }
    onPointerEnter?.(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      updatePointerCoords(e.clientX, e.clientY);
    }
    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    onPointerLeave?.(e);
  };

  const hslValue = SPOTLIGHT_HSL_MAP[glowColor] ?? SPOTLIGHT_HSL_MAP.blue;

  return (
    <div
      ref={cardRef}
      data-spotlight-color={glowColor}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          '--spot-hsl': hslValue,
          ...style,
        } as React.CSSProperties
      }
      className={`spotlight-card group relative rounded-2xl bg-[#151515] border border-[#262626] shadow-lg transition-colors duration-250 ${className}`}
      {...rest}
    >
      {/* Brilho externo discreto */}
      <div className="spotlight-outer-glow" aria-hidden="true" />

      {/* Reflexo sutil na superfície interna do card */}
      <div className="spotlight-surface" aria-hidden="true" />

      {/* Borda luminosa dinâmica que acompanha o ponteiro */}
      <div className="spotlight-border-ring" aria-hidden="true" />

      {/* Conteúdo do card acima das camadas de iluminação */}
      <div className="relative z-[2] h-full flex flex-col justify-between rounded-[inherit] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export const SpotlightCard = GlowCard;
