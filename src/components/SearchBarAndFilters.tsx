import React from 'react';
import { Search, X, Star, ArrowUpDown } from 'lucide-react';
import { Category, SortOption } from '../types';

interface SearchBarAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavoritesFilter: () => void;
  favoritesCount: number;
  categoryCounts: Record<string, number>;
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  showOnlyFavorites,
  onToggleFavoritesFilter,
  favoritesCount,
  categoryCounts,
  totalCount,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-6 mb-9">
      {/* Linha Superior: Busca, Favoritos e Ordenação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Campo de Busca Minimalista */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6E6E6E] stroke-[1.35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar referências, estilos ou prompts..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#111111] border border-[#222222] hover:border-[#2E2E2E] focus:border-[#C6A75E]/60 rounded-md text-xs sm:text-sm font-light text-[#EAE7E0] placeholder-[#6E6E6E] outline-none transition-colors duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#EAE7E0] p-1 cursor-pointer transition-colors"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          )}
        </div>

        {/* Controles Laterais: Favoritos e Ordenação */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleFavoritesFilter}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-light border transition-colors duration-200 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
              showOnlyFavorites
                ? 'bg-[#C6A75E]/10 border-[#C6A75E]/50 text-[#D5BD83]'
                : 'bg-[#111111] border-[#222222] text-[#EAE7E0] hover:border-[#343434]'
            }`}
            title="Filtrar apenas referências marcadas como favoritas"
          >
            <Star
              className={`w-3.5 h-3.5 stroke-[1.35] ${
                showOnlyFavorites ? 'fill-[#C6A75E] text-[#C6A75E]' : 'text-[#929292]'
              }`}
            />
            <span>Favoritos</span>
            <span className="tabular-nums text-[11px] text-[#929292]">
              {favoritesCount}
            </span>
          </button>

          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Ordenar referências"
              className="w-full appearance-none bg-[#111111] border border-[#222222] hover:border-[#343434] focus:border-[#C6A75E]/60 rounded-md px-3.5 py-2.5 pr-9 text-xs font-light text-[#EAE7E0] outline-none cursor-pointer transition-colors duration-200"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="alphabetical">Ordem Alfabética</option>
              <option value="favorites">Favoritos primeiro</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6E6E6E] stroke-[1.35] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Barra Editorial de Categorias */}
      <nav
        aria-label="Filtrar por categoria"
        className="relative border-b border-[#1D1D1D]"
      >
        <div className="overflow-x-auto scrollbar-none flex items-center gap-1 sm:gap-2 -mb-px">
          {categories.map((cat, index) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count =
              cat.name.toLowerCase() === 'todas'
                ? totalCount
                : categoryCounts[cat.name] || 0;

            return (
              <React.Fragment key={cat.id}>
                {index > 0 && (
                  <span
                    className="h-3 w-px bg-[#1E1E1E] shrink-0 hidden sm:inline-block"
                    aria-hidden="true"
                  />
                )}
                <button
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-2.5 sm:px-3 py-3 text-xs tracking-[0.02em] whitespace-nowrap transition-colors duration-200 border-b cursor-pointer flex items-baseline gap-1.5 shrink-0 ${
                    isSelected
                      ? 'border-[#C6A75E] text-[#D5BD83] font-normal'
                      : 'border-transparent text-[#929292] hover:text-[#EAE7E0] font-light'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] tabular-nums transition-colors ${
                      isSelected ? 'text-[#C6A75E]' : 'text-[#636363]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
