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
  // Exibir na navegação apenas "Todas" e categorias com pelo menos 1 referência cadastrada
  const visibleCategories = categories.filter((cat) => {
    if (cat.name.toLowerCase() === 'todas') return true;
    return (categoryCounts[cat.name] || 0) > 0;
  });

  return (
    <div className="space-y-5 mb-8 sm:mb-10">
      {/* Linha Superior: Busca, Favoritos e Ordenação com alta legibilidade */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#FFD400] stroke-[2] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar referências, estilos ou prompts..."
            className="w-full min-h-[48px] pl-12 pr-10 py-3 bg-[#151515] border-2 border-[#2A2A2A] hover:border-[#3D3D3D] focus:border-[#FFD400] rounded-xl text-sm sm:text-base font-medium text-white placeholder-[#8E8E8E] outline-none transition-colors duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5B5B5] hover:text-white p-1.5 rounded-lg hover:bg-[#242424] cursor-pointer transition-colors"
              title="Limpar busca"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* Botões Favoritos e Ordenação */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleFavoritesFilter}
            className={`min-h-[48px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors duration-200 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
              showOnlyFavorites
                ? 'bg-[#FFD400] border-[#FFD400] text-[#080808] shadow-[0_4px_18px_rgba(255,212,0,0.3)]'
                : 'bg-[#202020] border-[#323232] hover:border-[#FFD400] text-white'
            }`}
            title="Filtrar apenas referências marcadas como favoritas"
          >
            <Star
              className={`w-4 h-4 stroke-[2.2] ${
                showOnlyFavorites
                  ? 'fill-[#080808] text-[#080808]'
                  : 'text-[#FFD400]'
              }`}
            />
            <span>Favoritos</span>
            <span
              className={`tabular-nums px-2 py-0.5 rounded-md text-xs font-extrabold ${
                showOnlyFavorites
                  ? 'bg-[#080808]/15 text-[#080808]'
                  : 'bg-[#2C2C2C] text-[#FFD400]'
              }`}
            >
              {favoritesCount}
            </span>
          </button>

          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Ordenar referências"
              className="w-full min-h-[48px] appearance-none bg-[#202020] border-2 border-[#323232] hover:border-[#FFD400] focus:border-[#FFD400] rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-colors duration-200"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="alphabetical">Ordem Alfabética</option>
              <option value="favorites">Favoritos primeiro</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-[#FFD400] stroke-[2.2] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navegação das Categorias: Apenas categorias com conteúdo + "Todas" */}
      <nav aria-label="Filtrar por categoria">
        <div className="overflow-x-auto scrollbar-none flex items-center gap-2.5 pb-1.5">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count =
              cat.name.toLowerCase() === 'todas'
                ? totalCount
                : categoryCounts[cat.name] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer flex items-center gap-2.5 shrink-0 border-2 ${
                  isSelected
                    ? 'bg-[#FFD400] border-[#FFD400] text-[#080808] font-bold shadow-[0_6px_20px_-4px_rgba(255,212,0,0.4)]'
                    : 'bg-[#151515] border-[#292929] hover:bg-[#202020] hover:border-[#FFD400]/70 text-white font-semibold'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-xs tabular-nums font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-[#080808]/15 text-[#080808]'
                      : 'bg-[#222222] text-[#FFD400]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
