import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { PhotoReference } from '../types';

interface DeleteConfirmModalProps {
  reference: PhotoReference | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  reference,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !reference) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/88 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#121212] border border-[#242424] rounded-xl overflow-hidden shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#929292] hover:text-[#EAE7E0] p-1.5 rounded-md hover:bg-[#1B1B1B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="font-display text-xl font-normal text-[#EAE7E0]">
              Confirmar Exclusão
            </h3>
            <p className="text-xs font-light text-[#929292]">
              Esta ação removerá a referência e o prompt permanentemente.
            </p>
          </div>
        </div>

        <div className="my-4 p-3 bg-[#0A0A0A] rounded-lg border border-[#1E1E1E] flex items-center gap-3">
          <img
            src={reference.imageUrl}
            alt={reference.title}
            referrerPolicy="no-referrer"
            className="w-12 h-14 object-cover rounded border border-[#282828]"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-normal text-[#EAE7E0] truncate">{reference.title}</p>
            <p className="text-[11px] font-light text-[#C6A75E] mt-0.5">{reference.category}</p>
          </div>
        </div>

        <p className="text-xs font-light text-[#929292] mb-6 leading-relaxed">
          Tem certeza de que deseja excluir{' '}
          <span className="text-[#EAE7E0] font-normal">"{reference.title}"</span> do catálogo?
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[#242424] text-[#929292] hover:text-[#EAE7E0] hover:bg-[#181818] text-xs font-light cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white font-medium text-xs uppercase tracking-[0.08em] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
