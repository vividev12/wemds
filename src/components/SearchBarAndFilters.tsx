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
    <div className="space-y-4 mb-8">
      {/* Upper Bar: Search Input & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar referências..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#141414] border border-[#262626] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg text-sm text-white placeholder-neutral-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Favorites and Sort Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Favorites Filter Button */}
          <button
            onClick={onToggleFavoritesFilter}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
              showOnlyFavorites
                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-[#141414] border-[#262626] text-neutral-300 hover:border-neutral-600 hover:text-white'
            }`}
            title="Filtrar apenas referências marcadas como favoritas"
          >
            <Star
              className={`w-4 h-4 ${
                showOnlyFavorites ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-400'
              }`}
            />
            <span className="whitespace-nowrap">Favoritos</span>
            <span className="tabular-nums opacity-80 text-xs">({favoritesCount})</span>
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-[#141414] border border-[#262626] hover:border-neutral-600 focus:border-[#D4AF37] rounded-lg px-3.5 py-2.5 pr-8 text-xs sm:text-sm text-neutral-200 outline-none cursor-pointer"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="alphabetical">Ordem Alfabética</option>
              <option value="favorites">Favoritos primeiro</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories Bar: Horizontal scrollable segmented tabs */}
      <div className="overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5 border-b border-[#1A1A1A]">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const count =
            cat.name.toLowerCase() === 'todas'
              ? totalCount
              : categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'border-[#D4AF37] text-[#D4AF37] font-semibold bg-[#D4AF37]/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[11px] tabular-nums px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    : 'bg-[#1F1F1F] text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
