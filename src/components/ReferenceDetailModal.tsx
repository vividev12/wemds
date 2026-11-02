import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Star, ChevronLeft, ChevronRight, Edit3, Trash2, Calendar, Sparkles } from 'lucide-react';
import { PhotoReference } from '../types';

interface ReferenceDetailModalProps {
  reference: PhotoReference | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin: boolean;
  onEdit: (ref: PhotoReference) => void;
  onDelete: (ref: PhotoReference) => void;
}

export const ReferenceDetailModal: React.FC<ReferenceDetailModalProps> = ({
  reference,
  isOpen,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  onToggleFavorite,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigatePrev();
      if (e.key === 'ArrowRight' && hasNext) onNavigateNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onClose, onNavigatePrev, onNavigateNext]);

  if (!isOpen || !reference) return null;

  const handleCopyPrompt = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reference.prompt);
      } else {
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
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const wordCount = reference.prompt.trim().split(/\s+/).filter(Boolean).length;
  const charCount = reference.prompt.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Buttons for Carousel */}
        {hasPrev && (
          <button
            onClick={onNavigatePrev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/80 hover:bg-[#D4AF37] text-white hover:text-black border border-white/20 transition-all cursor-pointer shadow-lg"
            title="Referência anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNavigateNext}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/80 hover:bg-[#D4AF37] text-white hover:text-black border border-white/20 transition-all cursor-pointer shadow-lg"
            title="Próxima referência (Seta direita)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Top Floating Controls on Mobile / Close button */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(reference.id)}
            className="p-2 rounded-lg bg-black/70 hover:bg-black text-neutral-300 hover:text-[#D4AF37] border border-white/10 transition-colors cursor-pointer"
            title={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
          >
            <Star
              className={`w-4 h-4 ${
                reference.isFavorite ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-400'
              }`}
            />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/70 hover:bg-red-950/80 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left Side: Large Photo Preview */}
        <div className="md:w-1/2 bg-[#0A0A0A] flex items-center justify-center relative p-3 sm:p-5 overflow-hidden border-b md:border-b-0 md:border-r border-[#262626]">
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[560px] flex items-center justify-center">
            <img
              src={reference.imageUrl}
              alt={reference.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
            />
          </div>

          {/* Mobile Carousel Arrows */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
            {hasPrev ? (
              <button
                onClick={onNavigatePrev}
                className="pointer-events-auto p-2 rounded-full bg-black/75 text-white border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : <span />}
            {hasNext ? (
              <button
                onClick={onNavigateNext}
                className="pointer-events-auto p-2 rounded-full bg-black/75 text-white border border-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <span />}
          </div>
        </div>

        {/* Right Side: Reference Information & Full Prompt */}
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[560px] bg-[#141414]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-[#D4AF37] tracking-wider uppercase">
                  {reference.category}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {new Date(reference.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {reference.title}
              </h2>
              <div className="mt-1 flex items-center gap-3">
                <a
                  href={reference.originalImage || reference.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#D4AF37] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Abrir imagem original no Imgur</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
              {reference.notes && (
                <p className="text-xs text-neutral-400 mt-1 italic">
                  {reference.notes}
                </p>
              )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Prompt Completo
                </span>
                <span className="font-mono text-[11px] text-neutral-500 tabular-nums">
                  {wordCount} palavras · {charCount} carac.
                </span>
              </div>

              {/* Prompt Text Field */}
              <div className="relative rounded-xl border border-[#2A2A2A] bg-[#0E0E0E] p-4 font-mono text-xs text-neutral-200 leading-relaxed max-h-56 overflow-y-auto selection:bg-[#D4AF37]/40 selection:text-white">
                <p className="whitespace-pre-wrap select-all font-mono">
                  {reference.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-4 border-t border-[#222222] space-y-3">
            {/* Primary Gold Copy Button */}
            <button
              onClick={handleCopyPrompt}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${
                copied
                  ? 'bg-[#1F2B1C] border border-[#48B02C] text-[#55D833]'
                  : 'bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C5A028] text-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✓ Prompt copiado com sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPIAR PROMPT COMPLETO</span>
                </>
              )}
            </button>

            {/* Admin Management Buttons inside Modal */}
            {isAdmin && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(reference);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg border border-[#333333] hover:border-[#D4AF37] bg-[#1A1A1A] hover:bg-[#202020] text-xs font-medium text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Editar Referência</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(reference);
                  }}
                  className="py-2 px-3 rounded-lg border border-[#333333] hover:border-red-900 bg-[#1A1A1A] hover:bg-[#241515] text-xs font-medium text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
