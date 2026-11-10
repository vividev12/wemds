import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Copy, Check, Star, Edit3, Trash2, ExternalLink, ImageOff } from 'lucide-react';
import { PhotoReference } from '../types';
import { SpotlightCard, SpotlightColor, SPOTLIGHT_COLORS } from './ui/spotlight-card';

interface PhotoCardProps {
  reference: PhotoReference;
  isAdmin: boolean;
  spotlightColor?: SpotlightColor;
  onOpenDetail: (ref: PhotoReference) => void;
  onEdit: (ref: PhotoReference) => void;
  onDelete: (ref: PhotoReference) => void;
  onToggleFavorite: (id: string) => void;
}

interface FramingConfig {
  fitClass: 'object-cover' | 'object-contain';
  posClass: string;
}

const IMAGE_FRAMING_OVERRIDES: Record<string, FramingConfig> = {
  // Square (1:1) dark studio full-body / couple shots: contain blends into #0E0E0E and preserves 100% of composition
  'ref-4': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-5': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-6': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-10': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-13': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-14': { fitClass: 'object-contain', posClass: 'object-center' },
  'ref-15': { fitClass: 'object-contain', posClass: 'object-center' },

  // Square (1:1) light/outdoor studio shots: cover with top/horizontal focus on subject
  'ref-2': { fitClass: 'object-cover', posClass: 'object-[55%_15%]' },
  'ref-3': { fitClass: 'object-cover', posClass: 'object-[50%_15%]' },
  'ref-8': { fitClass: 'object-cover', posClass: 'object-[50%_15%]' },
  'ref-11': { fitClass: 'object-cover', posClass: 'object-[50%_18%]' },

  // Special aspect ratios & close-up foreground candle shots
  'ref-20': { fitClass: 'object-cover', posClass: 'object-[50%_8%]' },
  'ref-33': { fitClass: 'object-cover', posClass: 'object-[50%_12%]' },
  'ref-37': { fitClass: 'object-cover', posClass: 'object-[50%_8%]' },
  'ref-40': { fitClass: 'object-cover', posClass: 'object-[50%_4%]' },
  'ref-64': { fitClass: 'object-cover', posClass: 'object-[50%_12%]' },
};

function getImageFraming(id: string, naturalRatio: number | null): FramingConfig {
  if (IMAGE_FRAMING_OVERRIDES[id]) {
    return IMAGE_FRAMING_OVERRIDES[id];
  }
  if (naturalRatio === null) {
    // Safe top-biased default before natural dimensions load
    return { fitClass: 'object-cover', posClass: 'object-[50%_10%]' };
  }
  if (naturalRatio < 0.72) {
    // Tall vertical portraits (2:3, 9:16): anchor near top so head and face are never cropped
    return { fitClass: 'object-cover', posClass: 'object-[50%_8%]' };
  }
  if (naturalRatio <= 0.85) {
    // 3:4 and 4:5 portraits: keep head and upper composition naturally framed
    return { fitClass: 'object-cover', posClass: 'object-[50%_15%]' };
  }
  if (naturalRatio <= 1.05) {
    // Square 1:1 portraits
    return { fitClass: 'object-cover', posClass: 'object-[50%_18%]' };
  }
  // Wide/landscape images: preserve full horizontal composition
  return { fitClass: 'object-contain', posClass: 'object-center' };
}

function getDeterministicSpotlightColor(id: string): SpotlightColor {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SPOTLIGHT_COLORS[hash % SPOTLIGHT_COLORS.length];
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  reference,
  isAdmin,
  spotlightColor,
  onOpenDetail,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalRatio(img.naturalWidth / img.naturalHeight);
      setImageLoaded(true);
    }
  }, [reference.imageUrl]);

  const originalTarget = reference.originalImage || reference.imageUrl;
  const framing = getImageFraming(reference.id, naturalRatio);
  const resolvedSpotlightColor =
    spotlightColor ?? getDeterministicSpotlightColor(reference.id);

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reference.prompt);
      } else {
        // Fallback for restricted clipboard contexts
        const textArea = document.createElement('textarea');
        textArea.value = reference.prompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
    }
  };

  return (
    <article className="h-full">
      <SpotlightCard
        glowColor={resolvedSpotlightColor}
        className="h-full focus-within:ring-2 focus-within:ring-[#FFD400]/80"
      >
        {/* Faixa Superior Externa: Categoria discreta + Ícones visíveis (sem cobrir rostos) */}
        <div className="px-3 py-2.5 bg-[#1B1B1B]/90 border-b border-[#292929] flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-[#FFD400] tracking-wide truncate"
            title={reference.category}
          >
            {reference.category}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(reference.id);
              }}
              aria-label={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
              className="p-2 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white hover:text-[#FFD400] border border-[#343434] hover:border-[#FFD400]/60 transition-colors cursor-pointer"
              title={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
            >
              <Star
                className={`w-4 h-4 stroke-[2] ${
                  reference.isFavorite ? 'fill-[#FFD400] text-[#FFD400]' : 'text-[#B5B5B5]'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(reference);
              }}
              aria-label="Ampliar fotografia"
              className="p-2 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white hover:text-[#FFD400] border border-[#343434] hover:border-[#FFD400]/60 transition-colors cursor-pointer"
              title="Visualizar foto ampliada e prompt"
            >
              <Maximize2 className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Fotografia de Prévia (Protagonista e absolutamente estática no hover) */}
        <div
          onClick={() => onOpenDetail(reference)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenDetail(reference);
            }
          }}
          aria-label={`Ampliar fotografia da categoria ${reference.category}`}
          className="relative aspect-[3/4] w-full bg-[#0E0E0E] overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFD400]"
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#171717] animate-pulse flex items-center justify-center">
              <span className="text-xs text-[#B5B5B5] font-semibold tracking-wider uppercase">
                Carregando
              </span>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 bg-[#151515] p-4 flex flex-col items-center justify-center text-center">
              <div className="w-11 h-11 rounded-full border-2 border-[#FFD400]/40 flex items-center justify-center text-[#FFD400] mb-3">
                <ImageOff className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-xs text-[#B5B5B5] font-semibold mb-3">{reference.category}</p>
              <a
                href={originalTarget}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#202020] hover:bg-[#2B2B2B] text-[#FFD400] text-xs font-bold border border-[#383838] transition-colors"
              >
                <span>Abrir imagem</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
              </a>
            </div>
          ) : (
            <img
              ref={imgRef}
              src={reference.imageUrl}
              alt={`Referência fotográfica ${reference.category}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalRatio(img.naturalWidth / img.naturalHeight);
                }
                setImageLoaded(true);
              }}
              onError={() => setImageError(true)}
              className={`w-full h-full ${framing.fitClass} ${framing.posClass} transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Controles Administrativos */}
          {isAdmin && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 bg-[#080808]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#3A3A3A]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(reference);
                }}
                className="p-1.5 text-white hover:text-[#FFD400] hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                title="Editar referência"
              >
                <Edit3 className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(reference);
                }}
                className="p-1.5 text-white hover:text-red-400 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                title="Excluir referência"
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          )}
        </div>

        {/* Botão Principal Amarelo Forte: COPIAR PROMPT (sem títulos ou textos abaixo) */}
        <div className="p-2.5 sm:p-3.5 bg-[#151515]/85 border-t border-[#252525]">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`w-full min-h-[46px] sm:min-h-[48px] py-3 px-2.5 sm:px-4 rounded-xl text-[11px] sm:text-sm font-extrabold uppercase tracking-[0.04em] sm:tracking-wider transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              copied
                ? 'bg-[#14351A] border-2 border-[#39C94A] text-[#7CFF8E]'
                : 'bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808] border-2 border-[#FFD400] hover:border-[#FFCC00] shadow-[0_4px_16px_rgba(255,212,0,0.2)]'
            }`}
            title="Copiar prompt completo para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.8] shrink-0" />
                <span>Prompt copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.3] shrink-0" />
                <span>COPIAR PROMPT</span>
              </>
            )}
          </button>
        </div>
      </SpotlightCard>
    </article>
  );
};
