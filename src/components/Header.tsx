import React from 'react';
import { Plus, Settings, LogOut } from 'lucide-react';

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
    <header className="border-b-2 border-[#FFD400]/25 bg-[#080808]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-[72px] sm:h-22 flex items-center justify-between gap-2 sm:gap-6">
        {/* Marca Principal Forte & Imponente */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            aria-hidden="true"
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFD400] text-[#080808] font-brand font-extrabold text-xs sm:text-base tracking-tight flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(255,212,0,0.28)]"
          >
            WM
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="font-brand text-[13px] sm:text-2xl font-extrabold tracking-wide uppercase text-white leading-none whitespace-nowrap">
              PRÉVIAS <span className="text-[#FFD400]">WE MEDIA</span>
            </h1>
            <span className="font-sans text-[9px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[#B5B5B5] mt-1 sm:mt-1.5 leading-none whitespace-nowrap">
              CATÁLOGO E MÍDIA
            </span>
          </div>
        </div>

        {/* Contador de Referências + Acesso Administrativo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#151515] border border-[#2C2C2C]">
            <span className="tabular-nums font-bold text-sm text-[#FFD400]">
              {totalReferences}
            </span>
            <span className="text-xs font-semibold text-[#B5B5B5] whitespace-nowrap">
              referências
            </span>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808] font-bold text-xs sm:text-sm px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 shadow-[0_4px_16px_rgba(255,212,0,0.25)]"
                title="Cadastrar nova referência fotográfica e prompt"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Adicionar Referência</span>
                <span className="sm:hidden">Adicionar</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-[#323232] hover:border-[#FFD400] bg-[#151515] hover:bg-[#202020] text-white text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                title="Configurações, Nuvem e Backup"
              >
                <Settings className="w-4 h-4 text-[#FFD400] stroke-[2]" />
                <span className="hidden lg:inline">Configurações</span>
              </button>

              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-[#323232] hover:border-red-500/70 bg-[#151515] hover:bg-[#241414] text-[#B5B5B5] hover:text-red-300 text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Sair do modo administrador"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
                <span className="hidden lg:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              title="Acesso administrativo"
              aria-label="Acesso administrativo"
              className="p-2 -mr-1 bg-transparent border-0 inline-flex items-center justify-center cursor-pointer shrink-0 transition-opacity duration-200 hover:opacity-80 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded-lg"
            >
              <img
                src="/account-icon-yellow.png"
                alt="Acesso administrativo"
                width={22}
                height={22}
                draggable={false}
                className="w-[22px] h-[22px] object-contain pointer-events-none select-none"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
