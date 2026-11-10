import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { PhotoCard } from './components/PhotoCard';
import { ReferenceDetailModal } from './components/ReferenceDetailModal';
import { ReferenceFormModal } from './components/ReferenceFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsAndCloudModal } from './components/SettingsAndCloudModal';
import { storageService } from './services/storage';
import { PhotoReference, Category, SortOption } from './types';
import { ImageOff } from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [references, setReferences] = useState<PhotoReference[]>(() =>
    storageService.getReferences()
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    storageService.getCategories()
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(() =>
    storageService.isAdmin()
  );

  // --- Filtering & Sorting States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // --- Modals States ---
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<PhotoReference | null>(null);

  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<PhotoReference | null>(null);

  // Reload data helper
  const reloadData = useCallback(() => {
    setReferences(storageService.getReferences());
    setCategories(storageService.getCategories());
    setIsAdmin(storageService.isAdmin());
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ref of references) {
      counts[ref.category] = (counts[ref.category] || 0) + 1;
    }
    return counts;
  }, [references]);

  const favoritesCount = useMemo(() => {
    return references.filter((r) => r.isFavorite).length;
  }, [references]);

  // Filtered & Sorted References
  const filteredReferences = useMemo(() => {
    let result = [...references];

    // Filter by category
    if (selectedCategory.toLowerCase() !== 'todas') {
      result = result.filter(
        (ref) => ref.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by favorites
    if (showOnlyFavorites) {
      result = result.filter((ref) => ref.isFavorite);
    }

    // Filter by search query (title, category, prompt)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ref) =>
          ref.title.toLowerCase().includes(q) ||
          (ref.originalTitle && ref.originalTitle.toLowerCase().includes(q)) ||
          ref.category.toLowerCase().includes(q) ||
          ref.prompt.toLowerCase().includes(q) ||
          (ref.notes && ref.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'favorites') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // default 'recent'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [references, selectedCategory, showOnlyFavorites, searchQuery, sortBy]);

  // Active reference for Detail Modal
  const activeReference = useMemo(() => {
    if (!activeReferenceId) return null;
    return references.find((r) => r.id === activeReferenceId) || null;
  }, [activeReferenceId, references]);

  // Carousel navigation inside detail modal
  const activeIndex = useMemo(() => {
    if (!activeReferenceId) return -1;
    return filteredReferences.findIndex((r) => r.id === activeReferenceId);
  }, [activeReferenceId, filteredReferences]);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < filteredReferences.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrev) {
      setActiveReferenceId(filteredReferences[activeIndex - 1].id);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      setActiveReferenceId(filteredReferences[activeIndex + 1].id);
    }
  };

  // --- Handlers ---
  const handleOpenDetail = (ref: PhotoReference) => {
    setActiveReferenceId(ref.id);
    setDetailModalOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    storageService.toggleFavorite(id);
    setReferences(storageService.getReferences());
  };

  const handleOpenAddModal = () => {
    setEditingReference(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (ref: PhotoReference) => {
    setEditingReference(ref);
    setFormModalOpen(true);
  };

  const handleSaveReference = (refData: Omit<PhotoReference, 'id' | 'createdAt'>) => {
    storageService.saveReference(refData);
    setReferences(storageService.getReferences());
  };

  const handleUpdateReference = (id: string, updates: Partial<PhotoReference>) => {
    storageService.updateReference(id, updates);
    setReferences(storageService.getReferences());
  };

  const handleOpenDeleteConfirm = (ref: PhotoReference) => {
    setReferenceToDelete(ref);
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (referenceToDelete) {
      storageService.deleteReference(referenceToDelete.id);
      setReferences(storageService.getReferences());
      if (activeReferenceId === referenceToDelete.id) {
        setDetailModalOpen(false);
      }
    }
    setDeleteConfirmModalOpen(false);
    setReferenceToDelete(null);
  };

  const handleLoginAdmin = (pin: string) => {
    const success = storageService.login(pin);
    if (success) {
      setIsAdmin(true);
    }
    return success;
  };

  const handleLogoutAdmin = () => {
    storageService.logout();
    setIsAdmin(false);
  };

  const handleAddNewCategory = (name: string): Category => {
    const cat = storageService.addCategory(name);
    setCategories(storageService.getCategories());
    return cat;
  };

  const handleDeleteCategory = (id: string) => {
    storageService.deleteCategory(id);
    setCategories(storageService.getCategories());
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EAE7E0] flex flex-col font-sans selection:bg-[#C6A75E]/25 selection:text-[#D5BD83]">
      {/* 1. Header */}
      <Header
        isAdmin={isAdmin}
        totalReferences={references.length}
        onOpenAddModal={handleOpenAddModal}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-14 sm:pt-12 sm:pb-16">
        {/* Apresentação Editorial Principal */}
        <section className="mb-8 pb-7 border-b border-[#1A1A1A] flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#C6A75E]" aria-hidden="true" />
              <span className="text-[10px] font-light uppercase tracking-[0.26em] text-[#C6A75E]">
                Coleção Curada de Referências
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#EAE7E0] tracking-[-0.01em] leading-[1.12] text-balance">
              Galeria de Referências Fotográficas
            </h2>

            <p className="text-xs sm:text-[14px] font-light text-[#929292] leading-relaxed">
              Fotografias selecionadas por categoria editorial. Clique para ampliar ou copie o prompt integral instantaneamente.
            </p>
          </div>

          {/* Resumo Discreto da Seleção */}
          <div className="flex items-center gap-2.5 text-xs font-light text-[#929292] shrink-0">
            <span>
              <span className="tabular-nums font-normal text-[#EAE7E0]">
                {filteredReferences.length}
              </span>{' '}
              de{' '}
              <span className="tabular-nums">{references.length}</span> referências
            </span>
            {selectedCategory.toLowerCase() !== 'todas' && (
              <>
                <span aria-hidden="true" className="text-[#454545]">·</span>
                <span className="text-[#D5BD83] font-normal">
                  {selectedCategory}
                </span>
              </>
            )}
          </div>
        </section>

        {/* 3. Search Bar and Category Filters */}
        <SearchBarAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showOnlyFavorites={showOnlyFavorites}
          onToggleFavoritesFilter={() => setShowOnlyFavorites((prev) => !prev)}
          favoritesCount={favoritesCount}
          categoryCounts={categoryCounts}
          totalCount={references.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* 4. Photo Gallery Grid */}
        {filteredReferences.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredReferences.map((ref) => (
              <PhotoCard
                key={ref.id}
                reference={ref}
                isAdmin={isAdmin}
                onOpenDetail={handleOpenDetail}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteConfirm}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 px-5 text-center rounded-lg border border-[#1E1E1E] bg-[#111111]/70 max-w-lg mx-auto my-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#171717] border border-[#242424] flex items-center justify-center text-[#6E6E6E] mb-4">
              <ImageOff className="w-5 h-5 stroke-[1.35]" />
            </div>
            <h3 className="font-display text-xl font-normal text-[#EAE7E0] mb-1.5">
              Nenhuma referência encontrada
            </h3>
            <p className="text-xs font-light text-[#929292] max-w-sm mb-6 leading-relaxed">
              {searchQuery || showOnlyFavorites || selectedCategory !== 'Todas'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar a busca ou escolher outra categoria.'
                : 'Seu catálogo ainda está vazio. Adicione sua primeira referência pelo painel administrativo.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {(searchQuery || showOnlyFavorites || selectedCategory !== 'Todas') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                    setShowOnlyFavorites(false);
                  }}
                  className="px-4 py-2 rounded-md border border-[#262626] bg-[#171717] hover:border-[#C6A75E]/50 text-[#EAE7E0] text-xs font-light cursor-pointer transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-md bg-[#C6A75E] hover:bg-[#D5BD83] text-[#0A0A0A] font-medium text-xs tracking-wide cursor-pointer transition-colors"
                >
                  Adicionar Referência
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. Minimalist Editorial Footer */}
      <footer className="border-t border-[#181818] bg-[#0A0A0A] py-8 text-[#929292] text-xs font-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="font-brand text-sm tracking-[0.08em] uppercase text-[#EAE7E0]">
              PRÉVIAS <span className="text-[#C6A75E]">WE MEDIA</span>
            </span>
            <span aria-hidden="true" className="text-[#3A3A3A]">·</span>
            <span className="text-[11px] tracking-[0.14em] uppercase text-[#7A7A7A]">
              Catálogo e Mídia
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#7A7A7A]">
            <span>Curadoria Fotográfica</span>
            <span aria-hidden="true" className="text-[#3A3A3A]">·</span>
            <span>Prompts Integrais</span>
            <span aria-hidden="true" className="text-[#3A3A3A]">·</span>
            <span className="text-[#929292]">© 2026 We Media</span>
          </div>
        </div>
      </footer>

      {/* 6. Modals */}
      <ReferenceDetailModal
        reference={activeReference}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setActiveReferenceId(null);
        }}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onToggleFavorite={handleToggleFavorite}
        isAdmin={isAdmin}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteConfirm}
      />

      <ReferenceFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingReference(null);
        }}
        onSave={handleSaveReference}
        onUpdate={handleUpdateReference}
        initialData={editingReference}
        categories={categories}
        onAddNewCategory={handleAddNewCategory}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLogin={handleLoginAdmin}
      />

      <SettingsAndCloudModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddNewCategory}
        onDeleteCategory={handleDeleteCategory}
        onReloadData={reloadData}
      />

      <DeleteConfirmModal
        reference={referenceToDelete}
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setReferenceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
