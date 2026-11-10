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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#151515] border-2 border-[#2E2E2E] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B5B5B5] hover:text-white p-2 rounded-xl hover:bg-[#242424] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#FFD400]/15 border-2 border-[#FFD400]/50 flex items-center justify-center text-[#FFD400]">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight">
              Acesso Administrativo
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] mt-0.5">
              Área restrita ao proprietário do catálogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-white mb-1.5">
              Senha / Chave de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#FFD400] stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Digite sua senha de administrador..."
                autoFocus
                required
                className="w-full pl-10 pr-3.5 py-3 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none transition-colors"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2]" />
                <span>Senha incorreta. Tente novamente ou utilize a senha padrão.</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7CFF8E] mt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2]" />
                <span>Autenticado com sucesso. Carregando painel...</span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#0B0B0B] border border-[#242424] rounded-xl text-xs font-medium text-[#B5B5B5]">
            <p className="text-white font-bold">Primeiro acesso</p>
            <p className="mt-1 leading-relaxed">
              A senha padrão inicial é{' '}
              <code className="text-[#FFD400] font-mono font-bold bg-[#202020] px-1.5 py-0.5 rounded border border-[#343434]">
                {DEFAULT_ADMIN_PIN}
              </code>
              . Você pode alterá-la a qualquer momento em Configurações.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#343434] bg-[#202020] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
