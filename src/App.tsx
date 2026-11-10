import React, { useState, useMemo, useCallback, useRef } from 'react';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { PhotoCard } from './components/PhotoCard';
import { ReferenceDetailModal } from './components/ReferenceDetailModal';
import { ReferenceFormModal } from './components/ReferenceFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsAndCloudModal } from './components/SettingsAndCloudModal';
import { AnimatedMarqueeHero, MarqueeHeroImage } from './components/ui/hero-3';
import { storageService } from './services/storage';
import { PhotoReference, Category, SortOption } from './types';
import { SPOTLIGHT_COLORS } from './components/ui/spotlight-card';
import { ImageOff } from 'lucide-react';

const HERO_CATEGORY_ROTATION = [
  'Aniversário Feminino',
  'Ensaio Masculino Adulto',
  'Profissional Feminino',
  'Aniversário Gospel Evangélico',
  'PRÉVIAS',
];

function buildBalancedHeroImages(
  references: PhotoReference[],
  targetCount = 20
): MarqueeHeroImage[] {
  const buckets = new Map<string, PhotoReference[]>();
  const seenUrls = new Set<string>();

  for (const ref of references) {
    if (!ref.imageUrl) continue;
    const key = ref.category;
    const list = buckets.get(key) ?? [];
    list.push(ref);
    buckets.set(key, list);
  }

  const orderedCategories = [
    ...HERO_CATEGORY_ROTATION.filter((cat) => buckets.has(cat)),
    ...Array.from(buckets.keys()).filter(
      (cat) => !HERO_CATEGORY_ROTATION.includes(cat)
    ),
  ];

  const selected: MarqueeHeroImage[] = [];
  const cursors = new Map<string, number>();

  while (selected.length < targetCount) {
    let addedInRound = false;
    for (const cat of orderedCategories) {
      if (selected.length >= targetCount) break;
      const list = buckets.get(cat) ?? [];
      let idx = cursors.get(cat) ?? 0;

      while (idx < list.length && seenUrls.has(list[idx].imageUrl)) {
        idx += 1;
      }

      if (idx < list.length) {
        const ref = list[idx];
        seenUrls.add(ref.imageUrl);
        selected.push({
          id: ref.id,
          src: ref.imageUrl,
          alt: `Referência fotográfica ${ref.category} — We Media`,
          category: ref.category,
        });
        cursors.set(cat, idx + 1);
        addedInRound = true;
      } else {
        cursors.set(cat, idx);
      }
    }
    if (!addedInRound) break;
  }

  return selected;
}

export default function App() {
  const catalogRef = useRef<HTMLElement | null>(null);
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

  const heroImages = useMemo(
    () => buildBalancedHeroImages(references, 20),
    [references]
  );

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
    setCategories(storageService.getCategories());
  };

  const handleUpdateReference = (id: string, updates: Partial<PhotoReference>) => {
    storageService.updateReference(id, updates);
    setReferences(storageService.getReferences());
    setCategories(storageService.getCategories());
  };

  const handleOpenDeleteConfirm = (ref: PhotoReference) => {
    setReferenceToDelete(ref);
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (referenceToDelete) {
      storageService.deleteReference(referenceToDelete.id);
      setReferences(storageService.getReferences());
      setCategories(storageService.getCategories());
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

  const handleScrollToCatalog = useCallback(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    catalogRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#080808] text-white flex flex-col font-sans selection:bg-[#FFD400]/30 selection:text-[#FFD400]">
      {/* 1. Hero Premium começando no topo da página */}
      <AnimatedMarqueeHero
        brandBadge="WeMedia"
        title="Crie fotos incríveis com IA."
        subtitle="Escolha uma referência, copie o prompt e crie suas próprias imagens."
        ctaText="ACESSAR CATÁLOGO"
        onCtaClick={handleScrollToCatalog}
        images={heroImages}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onOpenAddModal={handleOpenAddModal}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* 2. Main Content Area */}
      <main
        ref={catalogRef}
        id="catalogo-referencias"
        className="scroll-mt-4 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-14 sm:pt-10 sm:pb-16"
      >
        {/* Apresentação Principal Imponente */}
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-[#161616] via-[#121212] to-[#0C0C0C] border border-[#282828] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#FFD400]" aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#FFD400]">
                Catálogo Oficial de Referências
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-tight text-balance">
              Galeria de Referências Fotográficas
            </h2>

            <p className="text-sm sm:text-base font-medium text-[#B5B5B5] leading-relaxed">
              Explore as prévias por categoria e clique em{' '}
              <span className="text-[#FFD400] font-bold">COPIAR PROMPT</span> para copiar a referência integral com um clique.
            </p>
          </div>

          {/* Bloco de Contagem Visível */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-[#202020] border border-[#303030] shrink-0 self-start lg:self-auto">
            <span className="text-sm font-semibold text-[#B5B5B5]">
              Exibindo{' '}
              <span className="tabular-nums font-extrabold text-[#FFD400] text-base">
                {filteredReferences.length}
              </span>{' '}
              de{' '}
              <span className="tabular-nums font-bold text-white">
                {references.length}
              </span>{' '}
              referências
            </span>
            {selectedCategory.toLowerCase() !== 'todas' && (
              <>
                <span aria-hidden="true" className="text-[#555555]">·</span>
                <span className="text-sm font-bold text-[#FFD400]">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
            {filteredReferences.map((ref, index) => (
              <PhotoCard
                key={ref.id}
                reference={ref}
                isAdmin={isAdmin}
                spotlightColor={SPOTLIGHT_COLORS[index % SPOTLIGHT_COLORS.length]}
                onOpenDetail={handleOpenDetail}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteConfirm}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-6 text-center rounded-2xl border-2 border-[#262626] bg-[#151515] max-w-lg mx-auto my-8 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFD400] mb-4">
              <ImageOff className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Nenhuma referência encontrada
            </h3>
            <p className="text-sm font-medium text-[#B5B5B5] max-w-sm mb-6 leading-relaxed">
              {searchQuery || showOnlyFavorites || selectedCategory !== 'Todas'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar a busca ou escolher outra categoria.'
                : 'Seu catálogo ainda está vazio. Adicione a primeira referência pelo acesso administrativo.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || showOnlyFavorites || selectedCategory !== 'Todas') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                    setShowOnlyFavorites(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border-2 border-[#363636] bg-[#202020] hover:border-[#FFD400] text-white text-sm font-bold cursor-pointer transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-bold text-sm cursor-pointer transition-colors"
                >
                  Adicionar Referência
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. Footer Black & Gold */}
      <footer className="border-t border-[#242424] bg-[#080808] py-8 text-[#B5B5B5] text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="font-brand text-sm sm:text-base font-extrabold tracking-wide uppercase text-white">
              PRÉVIAS <span className="text-[#FFD400]">WE MEDIA</span>
            </span>
            <span aria-hidden="true" className="text-[#4A4A4A]">·</span>
            <span className="text-xs font-bold tracking-widest uppercase text-[#B5B5B5]">
              Catálogo e Mídia
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#B5B5B5]">
            <span>Curadoria Fotográfica</span>
            <span aria-hidden="true" className="text-[#4A4A4A]">·</span>
            <span>Prompts Integrais</span>
            <span aria-hidden="true" className="text-[#4A4A4A]">·</span>
            <span className="text-white font-semibold">© 2026 We Media</span>
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
