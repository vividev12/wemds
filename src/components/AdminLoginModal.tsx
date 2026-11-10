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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#121212] border border-[#242424] rounded-xl overflow-hidden shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#929292] hover:text-[#EAE7E0] p-1.5 rounded-md hover:bg-[#1B1B1B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#C6A75E]/10 border border-[#C6A75E]/25 flex items-center justify-center text-[#C6A75E]">
            <Lock className="w-4 h-4 stroke-[1.35]" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-normal text-[#EAE7E0] leading-none">
              Acesso Administrativo
            </h3>
            <p className="text-xs font-light text-[#929292] mt-1.5">
              Área restrita ao proprietário do catálogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-light text-[#EAE7E0] mb-1.5">
              Senha / Chave de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#6E6E6E] stroke-[1.35] absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-sm font-light text-[#EAE7E0] placeholder-[#5F5F5F] outline-none transition-colors"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs font-light text-red-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
                <span>Senha incorreta. Tente novamente ou utilize a senha padrão.</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1.5 text-xs font-light text-[#9ED890] mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
                <span>Autenticado com sucesso. Carregando painel...</span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#0A0A0A] border border-[#1E1E1E] rounded-md text-xs font-light text-[#929292]">
            <p className="text-[#EAE7E0] font-normal">Primeiro acesso</p>
            <p className="text-[11px] mt-1 leading-relaxed">
              A senha padrão inicial é{' '}
              <code className="text-[#D5BD83] font-mono bg-[#171717] px-1.5 py-0.5 rounded border border-[#242424]">
                {DEFAULT_ADMIN_PIN}
              </code>
              . Você pode alterá-la a qualquer momento em Configurações.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-[#242424] hover:border-[#343434] text-[#929292] hover:text-[#EAE7E0] text-xs font-light cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#C6A75E] hover:bg-[#D5BD83] text-[#0A0A0A] font-medium text-xs uppercase tracking-[0.1em] transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
