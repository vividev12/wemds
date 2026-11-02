import React from 'react';
import { Plus, Shield, ShieldCheck, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  totalReferences: number;
  onOpenAddModal: () => void;
  onOpenAdminLogin: () => void;
  onOpenSettings: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  totalReferences,
  onOpenAddModal,
  onOpenAdminLogin,
  onOpenSettings,
  onLogoutAdmin,
}) => {
  return (
    <header className="border-b border-[#1F1F1F] bg-[#0B0B0B]/95 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Subtitle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            <h1 className="font-brand text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider text-white flex items-center">
              Previas <span className="text-[#D4AF37] ml-1.5 font-bold">We media</span>
            </h1>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
            <span className="hidden md:inline-block text-xs uppercase tracking-widest text-neutral-400 font-sans">
              REFERÊNCIAS
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-0.5 tracking-wide">
            Catálogo de Referências &amp; Prompts
          </p>
        </div>

        {/* Zone 2: Editorial Meta / Stats */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-400 font-sans">
          <span className="tabular-nums font-medium text-[#D4AF37]">{totalReferences}</span>
          <span>referências cadastradas</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>Acesso Privado &amp; Curado</span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {isAdmin ? (
            <>
              {/* Botão dourado de Adicionar Referência */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C5A028] text-black font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap"
                title="Cadastrar nova referência fotográfica e prompt"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">+ ADICIONAR REFERÊNCIA</span>
                <span className="sm:hidden">+ ADICIONAR</span>
              </button>

              {/* Botão de Configurações / Supabase */}
              <button
                onClick={onOpenSettings}
                className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[#2A2A2A] hover:border-[#D4AF37]/50 bg-[#141414] hover:bg-[#1C1C1C] text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Configurações, Nuvem e Backup"
              >
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden md:inline">Configurações</span>
              </button>

              {/* Sair do Admin */}
              <button
                onClick={onLogoutAdmin}
                className="p-2 sm:px-2.5 sm:py-2 rounded-lg border border-[#2A2A2A] hover:border-red-900/50 bg-[#141414] hover:bg-[#1A1212] text-neutral-400 hover:text-red-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Sair do modo administrador"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#2A2A2A] hover:border-[#D4AF37]/60 bg-[#141414] hover:bg-[#1A1A1A] text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
              title="Acesso restrito ao proprietário para gerenciar catálogo"
            >
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Acesso Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
