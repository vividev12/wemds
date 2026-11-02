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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141414] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#202020] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Confirmar Exclusão
            </h3>
            <p className="text-xs text-neutral-400">
              Esta ação removerá a referência e o prompt permanentemente.
            </p>
          </div>
        </div>

        <div className="my-4 p-3 bg-[#0E0E0E] rounded-xl border border-[#222222] flex items-center gap-3">
          <img
            src={reference.imageUrl}
            alt={reference.title}
            className="w-12 h-14 object-cover rounded-lg border border-[#333333]"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{reference.title}</p>
            <p className="text-[11px] text-[#D4AF37] mt-0.5">{reference.category}</p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 mb-6">
          Tem certeza de que deseja excluir <span className="text-white font-medium">"{reference.title}"</span> do catálogo?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#2A2A2A] text-neutral-300 hover:text-white hover:bg-[#1A1A1A] text-xs font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
