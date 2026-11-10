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
        className="relative w-full max-w-md bg-[#151515] border-2 border-[#2E2E2E] rounded-2xl overflow-hidden shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B5B5B5] hover:text-white p-2 rounded-xl hover:bg-[#242424] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-950/50 border border-red-700/50 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-white">
              Confirmar Exclusão
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#B5B5B5]">
              Esta ação removerá a referência e o prompt permanentemente.
            </p>
          </div>
        </div>

        <div className="my-4 p-3 bg-[#0B0B0B] rounded-xl border border-[#262626] flex items-center gap-3">
          <img
            src={reference.imageUrl}
            alt={reference.title}
            referrerPolicy="no-referrer"
            className="w-12 h-14 object-cover rounded-lg border border-[#363636]"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{reference.title}</p>
            <p className="text-xs font-semibold text-[#FFD400] mt-0.5">{reference.category}</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] mb-6 leading-relaxed">
          Tem certeza de que deseja excluir{' '}
          <span className="text-white font-bold">"{reference.title}"</span> do catálogo?
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#343434] bg-[#202020] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
