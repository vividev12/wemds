import React from 'react';
import { Plus, Shield, Settings, LogOut } from 'lucide-react';

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
    <header className="border-b border-[#1E1E1E] bg-[#0A0A0A]/92 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-20 flex items-center justify-between gap-3 sm:gap-8">
        {/* Identidade Editorial Principal */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="font-brand text-base sm:text-2xl lg:text-[26px] font-normal tracking-[0.06em] sm:tracking-[0.07em] uppercase text-[#EAE7E0] leading-none whitespace-nowrap">
            PRÉVIAS <span className="text-[#C6A75E] font-medium">WE MEDIA</span>
          </h1>
          <span className="font-sans text-[8.5px] sm:text-[10px] font-light tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[#929292] mt-1.5 leading-none whitespace-nowrap">
            CATÁLOGO E MÍDIA
          </span>
        </div>

        {/* Contagem Discreta + Ações */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-xs font-light text-[#929292] whitespace-nowrap">
            <span className="w-px h-4 bg-[#222222]" aria-hidden="true" />
            <span>
              <span className="tabular-nums font-normal text-[#EAE7E0]">{totalReferences}</span>{' '}
              referências
            </span>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-[#C6A75E] hover:bg-[#D5BD83] active:bg-[#B2934B] text-[#0A0A0A] font-medium text-[11px] sm:text-xs tracking-[0.08em] uppercase px-3 sm:px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0"
                title="Cadastrar nova referência fotográfica e prompt"
              >
                <Plus className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Adicionar Referência</span>
                <span className="sm:hidden">Adicionar</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="p-2 sm:px-3 sm:py-2 rounded-md border border-[#242424] hover:border-[#C6A75E]/50 bg-[#111111] hover:bg-[#171717] text-[#EAE7E0] text-xs font-light transition-colors duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Configurações, Nuvem e Backup"
              >
                <Settings className="w-3.5 h-3.5 text-[#C6A75E] stroke-[1.35]" />
                <span className="hidden lg:inline">Configurações</span>
              </button>

              <button
                onClick={onLogoutAdmin}
                className="p-2 sm:px-3 sm:py-2 rounded-md border border-[#242424] hover:border-red-900/50 bg-[#111111] hover:bg-[#1A1212] text-[#929292] hover:text-red-300 text-xs font-light transition-colors duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Sair do modo administrador"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[1.35]" />
                <span className="hidden lg:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md border border-[#242424] hover:border-[#C6A75E]/50 bg-[#111111]/80 hover:bg-[#171717] text-[#EAE7E0] text-xs font-light tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0"
              title="Acesso restrito ao proprietário para gerenciar catálogo"
            >
              <Shield className="w-3.5 h-3.5 text-[#C6A75E] stroke-[1.35]" />
              <span>Acesso Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
