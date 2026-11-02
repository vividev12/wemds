import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Sparkles, Layers, SlidersHorizontal, ImageOff } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Editorial Subheader Banner */}
        <section className="mb-8 pb-6 border-b border-[#1A1A1A] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4AF37]">
                COLEÇÃO EXCLUSIVA DE PROMPTS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Galeria de Referências Fotográficas
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Fotografias de alta classe organizadas por categoria. Clique em qualquer botão dourado para copiar o prompt integral instantaneamente.
            </p>
          </div>

          {/* Quick Filter Info Tag */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0">
            <span className="tabular-nums font-semibold text-white">
              {filteredReferences.length}
            </span>
            <span>de {references.length} referências</span>
            {selectedCategory.toLowerCase() !== 'todas' && (
              <span className="px-2 py-0.5 rounded bg-[#1F1F1F] text-[#D4AF37] font-medium text-[11px]">
                {selectedCategory}
              </span>
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
          <div className="py-20 px-4 text-center rounded-2xl border border-[#222222] bg-[#101010]/60 max-w-lg mx-auto my-8 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center text-neutral-500 mb-4">
              <ImageOff className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Nenhuma referência encontrada
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">
              {searchQuery || showOnlyFavorites || selectedCategory !== 'Todas'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar a busca ou mudar de categoria.'
                : 'Seu catálogo ainda está vazio. Clique em "+ ADICIONAR REFERÊNCIA" para cadastrar a primeira.'}
            </p>
            <div className="flex gap-2.5">
              {(searchQuery || showOnlyFavorites || selectedCategory !== 'Todas') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                    setShowOnlyFavorites(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] text-neutral-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs cursor-pointer transition-colors"
                >
                  + Adicionar Referência
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. Minimalist Elegant Footer */}
      <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] py-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-sm tracking-wider text-white">
              Previas <span className="text-[#D4AF37] ml-0.5">We media</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Catálogo Particular de Referências &amp; Prompts</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-500">
            <span>Alta Fidelidade Fotográfica</span>
            <span aria-hidden="true">·</span>
            <span>Cópia Direta de Prompts</span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-400">© 2026 Previas We media</span>
          </div>
        </div>
      </footer>

      {/* 6. Modals */}
      {/* Detail / Lightbox Modal */}
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

      {/* Add / Edit Form Modal */}
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

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLogin={handleLoginAdmin}
      />

      {/* Settings & Cloud Modal */}
      <SettingsAndCloudModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddNewCategory}
        onDeleteCategory={handleDeleteCategory}
        onReloadData={reloadData}
      />

      {/* Delete Confirmation Modal */}
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
