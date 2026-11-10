import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Copy, Check, Star, Edit3, Trash2, ExternalLink, ImageOff } from 'lucide-react';
import { PhotoReference } from '../types';

interface PhotoCardProps {
  reference: PhotoReference;
  isAdmin: boolean;
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
  // Square (1:1) dark studio full-body / couple shots: contain blends into #111111 and preserves 100% of composition
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

export const PhotoCard: React.FC<PhotoCardProps> = ({
  reference,
  isAdmin,
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
    <article className="group bg-[#141414] rounded-lg overflow-hidden border border-[#202020] hover:border-[#C6A75E]/60 transition-colors transition-shadow duration-300 flex flex-col justify-between shadow-sm hover:shadow-[0_18px_42px_-16px_rgba(0,0,0,0.88)]">
      {/* Faixa Superior Externa à Fotografia: Categoria tipográfica + Favorito + Ampliar */}
      <div className="px-3 py-2 bg-[#111111] border-b border-[#1C1C1C] flex items-center justify-between gap-2">
        <span
          className="text-[10px] sm:text-[11px] font-light text-[#C6A75E]/90 tracking-[0.04em] truncate"
          title={reference.category}
        >
          {reference.category}
        </span>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(reference.id);
            }}
            className="p-1.5 rounded text-[#929292] hover:text-[#D5BD83] hover:bg-[#191919] transition-colors cursor-pointer"
            title={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
          >
            <Star
              className={`w-3.5 h-3.5 stroke-[1.35] ${
                reference.isFavorite ? 'fill-[#C6A75E] text-[#C6A75E]' : 'text-[#929292]'
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(reference);
            }}
            className="p-1.5 rounded text-[#929292] hover:text-[#EAE7E0] hover:bg-[#191919] transition-colors cursor-pointer"
            title="Visualizar foto ampliada e prompt"
          >
            <Maximize2 className="w-3.5 h-3.5 stroke-[1.35]" />
          </button>
        </div>
      </div>

      {/* 1. Imagem de Referência (Sem obstruções e estática no hover) */}
      <div
        onClick={() => onOpenDetail(reference)}
        className="relative aspect-[3/4] w-full bg-[#111111] overflow-hidden cursor-pointer"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#141414] animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-[#6E6E6E] font-light tracking-[0.2em] uppercase">
              Carregando
            </span>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 bg-[#121212] p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border border-[#C6A75E]/30 flex items-center justify-center text-[#C6A75E] mb-2.5">
              <ImageOff className="w-4 h-4 stroke-[1.35]" />
            </div>
            <p className="text-xs text-[#EAE7E0] font-normal mb-1 line-clamp-1">{reference.title}</p>
            <p className="text-[11px] text-[#929292] font-light mb-3">{reference.category}</p>
            <a
              href={originalTarget}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A1A1A] hover:bg-[#222222] text-[#D5BD83] text-[11px] font-light border border-[#2C2C2C] transition-colors"
            >
              <span>Abrir link original</span>
              <ExternalLink className="w-3 h-3 stroke-[1.35]" />
            </a>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={reference.imageUrl}
            alt={reference.title}
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

        {/* Admin Floating Edit/Delete buttons */}
        {isAdmin && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#0A0A0A]/85 backdrop-blur-md p-1 rounded border border-[#2A2A2A]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reference);
              }}
              className="p-1.5 text-[#929292] hover:text-[#D5BD83] hover:bg-white/5 rounded cursor-pointer transition-colors"
              title="Editar referência"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[1.35]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(reference);
              }}
              className="p-1.5 text-[#929292] hover:text-red-400 hover:bg-white/5 rounded cursor-pointer transition-colors"
              title="Excluir referência"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.35]" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Botão Dourado Refinado COPIAR PROMPT + Informações Editoriais */}
      <div className="p-3 sm:p-3.5 flex flex-col gap-3 flex-1 justify-between bg-[#171717]">
        <button
          onClick={handleCopyPrompt}
          className={`w-full py-2.5 px-3 rounded-md text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
            copied
              ? 'bg-[#172317] border border-[#3E6E38] text-[#9ED890]'
              : 'bg-[#C6A75E] hover:bg-[#D5BD83] active:bg-[#B2934B] text-[#0A0A0A]'
          }`}
          title="Copiar prompt completo para a área de transferência"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2]" />
              <span>Prompt copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 stroke-[1.6]" />
              <span>Copiar Prompt</span>
            </>
          )}
        </button>

        {/* Título leve e prévia discreta do prompt */}
        <div className="pt-2 border-t border-[#222222]">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              onClick={() => onOpenDetail(reference)}
              className="font-normal text-[13px] sm:text-sm text-[#EAE7E0] hover:text-[#D5BD83] transition-colors line-clamp-1 cursor-pointer tracking-[0.01em]"
              title={reference.title}
            >
              {reference.title}
            </h3>
            <button
              onClick={() => onOpenDetail(reference)}
              className="text-[11px] font-light text-[#929292] hover:text-[#D5BD83] transition-colors shrink-0 cursor-pointer"
            >
              Ver
            </button>
          </div>
          <p className="text-[11px] font-light text-[#848484] mt-1.5 line-clamp-2 leading-relaxed">
            {reference.prompt}
          </p>
        </div>
      </div>
    </article>
  );
};
