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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050505]/92 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl bg-[#111111] border border-[#242424] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Buttons for Carousel */}
        {hasPrev && (
          <button
            onClick={onNavigatePrev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-[#0A0A0A]/80 hover:bg-[#C6A75E] text-[#EAE7E0] hover:text-[#0A0A0A] border border-[#2E2E2E] hover:border-[#C6A75E] transition-colors duration-200 cursor-pointer"
            title="Referência anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNavigateNext}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-[#0A0A0A]/80 hover:bg-[#C6A75E] text-[#EAE7E0] hover:text-[#0A0A0A] border border-[#2E2E2E] hover:border-[#C6A75E] transition-colors duration-200 cursor-pointer"
            title="Próxima referência (Seta direita)"
          >
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(reference.id)}
            className="p-2 rounded-md bg-[#0A0A0A]/80 hover:bg-[#171717] text-[#929292] hover:text-[#D5BD83] border border-[#282828] transition-colors cursor-pointer"
            title={reference.isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
          >
            <Star
              className={`w-4 h-4 stroke-[1.35] ${
                reference.isFavorite ? 'fill-[#C6A75E] text-[#C6A75E]' : 'text-[#929292]'
              }`}
            />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-md bg-[#0A0A0A]/80 hover:bg-[#1F1515] text-[#929292] hover:text-[#EAE7E0] border border-[#282828] transition-colors cursor-pointer"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Left Side: Large Photo Preview */}
        <div className="md:w-1/2 bg-[#0A0A0A] flex items-center justify-center relative p-4 sm:p-6 overflow-hidden border-b md:border-b-0 md:border-r border-[#1F1F1F]">
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[560px] flex items-center justify-center">
            <img
              src={reference.imageUrl}
              alt={reference.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>

          {/* Mobile Carousel Arrows */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
            {hasPrev ? (
              <button
                onClick={onNavigatePrev}
                className="pointer-events-auto p-2 rounded-full bg-[#0A0A0A]/85 text-[#EAE7E0] border border-[#2E2E2E]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
              </button>
            ) : <span />}
            {hasNext ? (
              <button
                onClick={onNavigateNext}
                className="pointer-events-auto p-2 rounded-full bg-[#0A0A0A]/85 text-[#EAE7E0] border border-[#2E2E2E]"
              >
                <ChevronRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            ) : <span />}
          </div>
        </div>

        {/* Right Side: Reference Information & Full Prompt */}
        <div className="md:w-1/2 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[52vh] md:max-h-[580px] bg-[#141414]">
          <div className="space-y-5">
            {/* Header info */}
            <div className="pr-16">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-light text-[#C6A75E] tracking-[0.14em] uppercase">
                  {reference.category}
                </span>
                <span className="text-[#454545]" aria-hidden="true">·</span>
                <span className="text-[11px] font-light text-[#929292] flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-3 h-3 text-[#6E6E6E] stroke-[1.35]" />
                  {new Date(reference.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-[28px] font-normal text-[#EAE7E0] leading-tight">
                {reference.title}
              </h2>

              <div className="mt-2 flex items-center gap-3">
                <a
                  href={reference.originalImage || reference.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-light text-[#D5BD83] hover:text-[#EAE7E0] underline-offset-4 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <span>Abrir imagem original no Imgur</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>

              {reference.notes && (
                <p className="text-xs font-light text-[#929292] mt-2 italic">
                  {reference.notes}
                </p>
              )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-light text-[#EAE7E0] tracking-wide">
                  <FileText className="w-3.5 h-3.5 text-[#C6A75E] stroke-[1.35]" />
                  Prompt Completo
                </span>
                <span className="font-mono text-[11px] font-light text-[#7A7A7A] tabular-nums">
                  {wordCount} palavras · {charCount} carac.
                </span>
              </div>

              {/* Prompt Text Field */}
              <div className="relative rounded-lg border border-[#222222] bg-[#0D0D0D] p-4 font-mono text-xs font-light text-[#D8D4CC] leading-relaxed max-h-56 overflow-y-auto selection:bg-[#C6A75E]/30 selection:text-[#EAE7E0]">
                <p className="whitespace-pre-wrap select-all font-mono">
                  {reference.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-5 border-t border-[#202020] space-y-3">
            <button
              onClick={handleCopyPrompt}
              className={`w-full py-3 px-4 rounded-md text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                copied
                  ? 'bg-[#172317] border border-[#3E6E38] text-[#9ED890]'
                  : 'bg-[#C6A75E] hover:bg-[#D5BD83] active:bg-[#B2934B] text-[#0A0A0A]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span>Prompt copiado com sucesso</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[1.5]" />
                  <span>Copiar Prompt Completo</span>
                </>
              )}
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(reference);
                  }}
                  className="flex-1 py-2 px-3 rounded-md border border-[#282828] hover:border-[#C6A75E]/50 bg-[#171717] hover:bg-[#1D1D1D] text-xs font-light text-[#EAE7E0] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C6A75E] stroke-[1.35]" />
                  <span>Editar Referência</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(reference);
                  }}
                  className="py-2 px-3 rounded-md border border-[#282828] hover:border-red-900/60 bg-[#171717] hover:bg-[#221515] text-xs font-light text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.35]" />
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
