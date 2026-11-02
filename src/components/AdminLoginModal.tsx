import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ADMIN_PIN } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (pin: string) => boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const valid = onLogin(pin.trim());
    if (valid) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPin('');
        onClose();
      }, 700);
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141414] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#202020] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Acesso Administrativo
            </h3>
            <p className="text-xs text-neutral-400">
              Área restrita ao proprietário do catálogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Senha / Chave de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Digite sua senha de admin..."
                autoFocus
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0E0E0E] border border-[#2A2A2A] focus:border-[#D4AF37] rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Senha incorreta. Tente novamente ou use a senha padrão.</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1.5 text-xs text-[#55D833] mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Autenticado com sucesso! Carregando ferramentas...</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-xs text-neutral-400">
            <p className="font-medium text-neutral-300">Dica de primeiro acesso:</p>
            <p className="text-[11px] mt-0.5">
              A senha padrão inicial é <code className="text-[#D4AF37] font-mono font-bold bg-[#1A1A1A] px-1 py-0.5 rounded">{DEFAULT_ADMIN_PIN}</code>. Você pode alterá-la no menu de configurações a qualquer momento.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#262626] text-neutral-300 hover:text-white text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
