import React, { useState } from 'react';
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

  const originalTarget = reference.originalImage || reference.imageUrl;

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
    <article className="group bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-2xl hover:shadow-black/70">
      {/* 1. Imagem de Referência (Direct Imgur / Fallback) */}
      <div
        onClick={() => onOpenDetail(reference)}
        className="relative aspect-[3/4] w-full bg-[#111111] overflow-hidden cursor-pointer"
      >
        {/* Skeleton loading animation */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#161616] animate-pulse flex items-center justify-center">
            <span className="text-[11px] text-neutral-500 font-mono tracking-wider">CARREGANDO</span>
          </div>
        )}

        {/* Fallback if image fails to load */}
        {imageError ? (
          <div className="absolute inset-0 bg-[#151515] p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2.5">
              <ImageOff className="w-5 h-5" />
            </div>
            <p className="text-xs text-neutral-300 font-semibold mb-1 line-clamp-1">{reference.title}</p>
            <p className="text-[11px] text-neutral-500 mb-3">{reference.category}</p>
            <a
              href={originalTarget}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#222222] hover:bg-[#2C2C2C] text-[#D4AF37] text-[11px] font-medium border border-[#3A3A3A] transition-colors"
            >
              <span>Abrir link original</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <img
            src={reference.imageUrl}
            alt={reference.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Tag */}
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/80 backdrop-blur-md text-neutral-200 border border-white/10 tracking-wide pointer-events-auto">
            {reference.category}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Favorite Star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(reference.id);
              }}
              className="p-1.5 rounded-md bg-black/75 backdrop-blur-md hover:bg-black text-neutral-300 hover:text-[#D4AF37] border border-white/10 transition-colors cursor-pointer"
              title={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  reference.isFavorite ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-300'
                }`}
              />
            </button>

            {/* Quick Zoom Preview Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(reference);
              }}
              className="p-1.5 rounded-md bg-black/75 backdrop-blur-md hover:bg-black text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer opacity-90 group-hover:opacity-100"
              title="Visualizar foto ampliada e prompt"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Admin Floating Edit/Delete buttons */}
        {isAdmin && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 backdrop-blur-md p-1 rounded-lg border border-neutral-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reference);
              }}
              className="p-1 text-neutral-300 hover:text-[#D4AF37] hover:bg-white/10 rounded cursor-pointer"
              title="Editar referência"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(reference);
              }}
              className="p-1 text-neutral-300 hover:text-red-400 hover:bg-white/10 rounded cursor-pointer"
              title="Excluir referência"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Botão Dourado COPIAR PROMPT imediatamente abaixo da imagem */}
      <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 flex-1 justify-between bg-[#1A1A1A]">
        {/* Botão Dourado Principal */}
        <button
          onClick={handleCopyPrompt}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] ${
            copied
              ? 'bg-[#1A2E16] border border-[#48B02C] text-[#5DE237]'
              : 'bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C5A028] text-black'
          }`}
          title="Copiar prompt completo para a área de transferência"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>✓ Prompt copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPIAR PROMPT</span>
            </>
          )}
        </button>

        {/* Informações do Modelo */}
        <div className="pt-1 border-t border-[#252525]">
          <div className="flex items-center justify-between gap-2">
            <h3
              onClick={() => onOpenDetail(reference)}
              className="font-bold text-sm sm:text-[15px] text-white hover:text-[#D4AF37] transition-colors line-clamp-1 cursor-pointer"
              title={reference.title}
            >
              {reference.title}
            </h3>
            <button
              onClick={() => onOpenDetail(reference)}
              className="text-[11px] text-[#D4AF37] hover:underline font-medium shrink-0 cursor-pointer"
            >
              Ver
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed opacity-75">
            {reference.prompt}
          </p>
        </div>
      </div>
    </article>
  );
};
