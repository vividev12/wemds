import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Star, ChevronLeft, ChevronRight, Edit3, Trash2, Calendar, FileText } from 'lucide-react';
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
        className="relative w-full max-w-5xl bg-[#151515] border-2 border-[#2E2E2E] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel Buttons */}
        {hasPrev && (
          <button
            type="button"
            onClick={onNavigatePrev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-[#080808]/90 hover:bg-[#FFD400] text-white hover:text-[#080808] border border-[#3B3B3B] hover:border-[#FFD400] transition-colors duration-200 cursor-pointer shadow-lg"
            title="Referência anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={onNavigateNext}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-[#080808]/90 hover:bg-[#FFD400] text-white hover:text-[#080808] border border-[#3B3B3B] hover:border-[#FFD400] transition-colors duration-200 cursor-pointer shadow-lg"
            title="Próxima referência (Seta direita)"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* Top Right Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(reference.id)}
            className="p-2.5 rounded-xl bg-[#080808]/85 hover:bg-[#202020] text-[#B5B5B5] hover:text-[#FFD400] border border-[#343434] transition-colors cursor-pointer"
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
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#080808]/85 hover:bg-red-950/90 text-white border border-[#343434] transition-colors cursor-pointer"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Left Side: Large Photo Preview */}
        <div className="md:w-1/2 bg-[#080808] flex items-center justify-center relative p-4 sm:p-6 overflow-hidden border-b md:border-b-0 md:border-r border-[#282828]">
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[560px] flex items-center justify-center">
            <img
              src={reference.imageUrl}
              alt={reference.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>

          {/* Mobile Carousel Arrows */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
            {hasPrev ? (
              <button
                type="button"
                onClick={onNavigatePrev}
                className="pointer-events-auto p-2.5 rounded-full bg-[#080808]/90 text-white border border-[#3A3A3A]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
            ) : <span />}
            {hasNext ? (
              <button
                type="button"
                onClick={onNavigateNext}
                className="pointer-events-auto p-2.5 rounded-full bg-[#080808]/90 text-white border border-[#3A3A3A]"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            ) : <span />}
          </div>
        </div>

        {/* Right Side: Reference Info & Full Prompt */}
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[52vh] md:max-h-[580px] bg-[#151515]">
          <div className="space-y-4">
            <div className="pr-16">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-xs font-extrabold text-[#FFD400] tracking-wider uppercase">
                  {reference.category}
                </span>
                <span className="text-[#555555]" aria-hidden="true">·</span>
                <span className="text-xs font-semibold text-[#B5B5B5] flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#FFD400] stroke-[2]" />
                  {new Date(reference.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {reference.title}
              </h2>

              <div className="mt-2 flex items-center gap-3">
                <a
                  href={reference.originalImage || reference.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-[#FFD400] hover:text-[#FFCC00] underline-offset-4 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <span>Abrir imagem original no Imgur</span>
                  <span>↗</span>
                </a>
              </div>

              {reference.notes && (
                <p className="text-xs font-medium text-[#B5B5B5] mt-2 italic">
                  {reference.notes}
                </p>
              )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <FileText className="w-4 h-4 text-[#FFD400] stroke-[2]" />
                  Prompt Completo
                </span>
                <span className="font-mono text-xs font-medium text-[#B5B5B5] tabular-nums">
                  {wordCount} palavras · {charCount} carac.
                </span>
              </div>

              <div className="relative rounded-xl border border-[#2C2C2C] bg-[#0B0B0B] p-4 font-mono text-xs text-neutral-100 leading-relaxed max-h-56 overflow-y-auto selection:bg-[#FFD400]/30 selection:text-white">
                <p className="whitespace-pre-wrap select-all font-mono">
                  {reference.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 mt-5 border-t border-[#262626] space-y-3">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`w-full min-h-[48px] py-3.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                copied
                  ? 'bg-[#14351A] border-2 border-[#39C94A] text-[#7CFF8E]'
                  : 'bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.8]" />
                  <span>Prompt copiado com sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.3]" />
                  <span>COPIAR PROMPT COMPLETO</span>
                </>
              )}
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(reference);
                  }}
                  className="flex-1 py-2.5 px-3.5 rounded-xl border border-[#343434] hover:border-[#FFD400] bg-[#202020] hover:bg-[#282828] text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-[#FFD400] stroke-[2]" />
                  <span>Editar Referência</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(reference);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#343434] hover:border-red-500/70 bg-[#202020] hover:bg-[#281515] text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2]" />
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
