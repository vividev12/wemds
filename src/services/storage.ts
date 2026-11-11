import { PhotoReference, Category, SupabaseConfig } from '../types';
import { SEED_PROMPTS } from '../data/seedPrompts';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'todas', name: 'Todas' },
  { id: 'previas', name: 'PRÉVIAS' },
  { id: 'aniversario-feminino', name: 'Aniversário Feminino' },
  { id: 'aniversario-gospel-evangelico', name: 'Aniversário Gospel Evangélico' },
  { id: 'profissional-feminino', name: 'Profissional Feminino' },
  { id: 'ensaio-masculino-adulto', name: 'Ensaio Masculino Adulto' },
  { id: 'casual-feminino', name: 'Casual Feminino' },
  { id: 'masculino-profissional', name: 'Masculino Profissional' },
];

export function resolveImgurUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Resolves Imgur album URL (e.g., https://imgur.com/a/lPVaHL7)
  const albumMatch = trimmed.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/i);
  if (albumMatch && albumMatch[1]) {
    return `https://i.imgur.com/${albumMatch[1]}.jpeg`;
  }
  // Resolves direct page URL without extension (e.g., https://imgur.com/lPVaHL7)
  const directPageMatch = trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (directPageMatch && directPageMatch[1] && !trimmed.includes('/a/')) {
    return `https://i.imgur.com/${directPageMatch[1]}.jpeg`;
  }
  return trimmed;
}

export const INITIAL_REFERENCES: PhotoReference[] = SEED_PROMPTS.map((item) => ({
  id: item.id,
  title: item.title,
  originalTitle: item.originalTitle,
  category: item.category,
  imageUrl: resolveImgurUrl(item.imageUrl),
  originalImage: item.originalImage,
  prompt: item.prompt,
  isFavorite: item.isFavorite,
  createdAt: item.createdAt,
}));

const STORAGE_KEYS = {
  REFERENCES: 'wemedia_references_v8',
  CATEGORIES: 'wemedia_categories_v3',
  BACKUP_PRE_PREVIAS: 'wemedia_backup_pre_previas_v1',
  RECLASS_52_V1: 'wemedia_reclass_52_v1',
  PRUNE_EMPTY_CATS_V1: 'wemedia_prune_empty_cats_v1',
  ADMIN_AUTH: 'wemedia_admin_auth_v1',
  ADMIN_PIN: 'wemedia_admin_pin_v1',
  SUPABASE_CONFIG: 'wemedia_supabase_config_v1',
};

export const DEFAULT_ADMIN_PIN = 'wemedia2026';

class StorageService {
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setInStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing ${key} to localStorage:`, e);
    }
  }

  // --- REFERENCES ---
  getReferences(): PhotoReference[] {
    let refs = this.getFromStorage<PhotoReference[]>(STORAGE_KEYS.REFERENCES, []);
    const seedAniver = INITIAL_REFERENCES.find((r) => r.id === 'ref-2' || r.title === 'Aniversário Marrom');

    if (!refs || refs.length === 0) {
      // Check previous storage versions to preserve all existing & custom entries
      const candidateKeys = [
        'wemedia_references_v7',
        'wemedia_references_v6',
        'wemedia_references_v5',
        'wemedia_references_v4',
        'wemedia_references_v3',
      ];
      let oldRefs: PhotoReference[] = [];
      for (const key of candidateKeys) {
        const found = this.getFromStorage<PhotoReference[]>(key, []);
        if (found && found.length > 0) {
          oldRefs = found;
          break;
        }
      }

      if (oldRefs && oldRefs.length > 0) {
        // Transactional backup snapshot before reorganizing existing references into PRÉVIAS
        const existingBackup = this.getFromStorage<unknown>(STORAGE_KEYS.BACKUP_PRE_PREVIAS, null);
        if (!existingBackup) {
          this.setInStorage(STORAGE_KEYS.BACKUP_PRE_PREVIAS, {
            backedUpAt: new Date().toISOString(),
            references: oldRefs,
            categories: this.getFromStorage<Category[]>('wemedia_categories_v2', DEFAULT_CATEGORIES),
          });
        }

        const migratedRefs = oldRefs.map((r) => {
          let updated: PhotoReference = {
            ...r,
            category: 'PRÉVIAS',
          };
          if (r.id === 'ref-1' || r.title === 'Profissional Masculino') {
            updated = {
              ...updated,
              imageUrl: 'https://i.imgur.com/0alVVQK.jpeg',
              originalImage: 'https://i.imgur.com/0alVVQK.jpeg',
            };
          }
          if ((r.id === 'ref-2' || r.title === 'Aniversário Marrom') && seedAniver) {
            updated = { ...updated, prompt: seedAniver.prompt };
          }
          return updated;
        });

        // Merge any missing seeds from INITIAL_REFERENCES without duplicating
        for (const seed of INITIAL_REFERENCES) {
          const exists = migratedRefs.some(
            (r) => r.id === seed.id || (r.imageUrl === seed.imageUrl && r.title === seed.title)
          );
          if (!exists) {
            migratedRefs.push({ ...seed });
          }
        }

        // Integrity check before committing
        const uniqueIds = new Set(migratedRefs.map((r) => r.id));
        if (migratedRefs.length >= oldRefs.length && uniqueIds.size === migratedRefs.length) {
          refs = migratedRefs;
        } else {
          // Rollback to safe copy preserving all oldRefs
          refs = oldRefs;
        }
      } else {
        refs = [...INITIAL_REFERENCES];
      }
      this.setInStorage(STORAGE_KEYS.REFERENCES, refs);
      return refs;
    }

    // Ensure known seed fixes stay applied without overriding categories of future commercial entries
    let hasUpdated = false;
    const reclassDone = this.getFromStorage<string>(STORAGE_KEYS.RECLASS_52_V1, '') === 'done';

    // Map ONLY the 52 new TXT references (ref-17..ref-68) by ID and Imgur URL (never by title)
    const previasIds = new Set(
      INITIAL_REFERENCES.slice(0, 16).map((s) => s.id)
    );
    const txtById = new Map<string, string>();
    const txtByUrl = new Map<string, string>();
    for (const seed of INITIAL_REFERENCES.slice(16, 68)) {
      txtById.set(seed.id, seed.category);
      txtByUrl.set(seed.imageUrl, seed.category);
    }

    refs = refs.map((r) => {
      let updated = { ...r };
      if ((r.id === 'ref-1' || r.title === 'Profissional Masculino') && r.imageUrl !== 'https://i.imgur.com/0alVVQK.jpeg') {
        hasUpdated = true;
        updated = { ...updated, imageUrl: 'https://i.imgur.com/0alVVQK.jpeg', originalImage: 'https://i.imgur.com/0alVVQK.jpeg' };
      }
      if ((r.id === 'ref-2' || r.title === 'Aniversário Marrom') && seedAniver && r.prompt !== seedAniver.prompt) {
        hasUpdated = true;
        updated = { ...updated, prompt: seedAniver.prompt };
      }

      // One-time in-place correction of category for existing 52 TXT items (PRÉVIAS ref-1..ref-16 remain untouched)
      if (!reclassDone && !previasIds.has(r.id)) {
        const expectedCat = txtById.get(r.id) || txtByUrl.get(r.imageUrl);
        if (expectedCat && r.category !== expectedCat) {
          hasUpdated = true;
          updated = { ...updated, category: expectedCat };
        }
      }
      return updated;
    });

    // Ensure no seed item is missing from refs
    for (const seed of INITIAL_REFERENCES) {
      const exists = refs.some(
        (r) => r.id === seed.id || (r.imageUrl === seed.imageUrl && r.title === seed.title)
      );
      if (!exists) {
        refs.push(seed);
        hasUpdated = true;
      }
    }

    if (hasUpdated) {
      this.setInStorage(STORAGE_KEYS.REFERENCES, refs);
    }
    if (!reclassDone) {
      this.setInStorage(STORAGE_KEYS.RECLASS_52_V1, 'done');
    }

    return refs;
  }

  saveReference(ref: Omit<PhotoReference, 'id' | 'createdAt'>): PhotoReference {
    const current = this.getReferences();
    const resolvedUrl = resolveImgurUrl(ref.imageUrl);
    const newRef: PhotoReference = {
      ...ref,
      imageUrl: resolvedUrl,
      originalImage: ref.imageUrl,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      isFavorite: ref.isFavorite ?? false,
    };
    const updated = [newRef, ...current];
    this.setInStorage(STORAGE_KEYS.REFERENCES, updated);
    return newRef;
  }

  updateReference(id: string, updates: Partial<PhotoReference>): PhotoReference | null {
    const current = this.getReferences();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const resolvedUrl = updates.imageUrl ? resolveImgurUrl(updates.imageUrl) : current[index].imageUrl;

    const updatedRef: PhotoReference = {
      ...current[index],
      ...updates,
      imageUrl: resolvedUrl,
      originalImage: updates.imageUrl || current[index].originalImage,
      updatedAt: new Date().toISOString(),
    };
    current[index] = updatedRef;
    this.setInStorage(STORAGE_KEYS.REFERENCES, current);
    return updatedRef;
  }

  deleteReference(id: string): boolean {
    const current = this.getReferences();
    const filtered = current.filter((item) => item.id !== id);
    if (filtered.length === current.length) return false;
    this.setInStorage(STORAGE_KEYS.REFERENCES, filtered);
    return true;
  }

  toggleFavorite(id: string): boolean {
    const current = this.getReferences();
    const item = current.find((r) => r.id === id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    this.setInStorage(STORAGE_KEYS.REFERENCES, [...current]);
    return item.isFavorite;
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    const refs = this.getReferences();
    const populatedCatNames = new Set(
      refs.map((r) => r.category.toLowerCase().trim())
    );
    const pruneDone =
      this.getFromStorage<string>(STORAGE_KEYS.PRUNE_EMPTY_CATS_V1, '') === 'done';

    const saved = this.getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!saved || saved.length === 0) {
      const oldCategories = this.getFromStorage<Category[]>('wemedia_categories_v2', []);
      const merged: Category[] = [...DEFAULT_CATEGORIES];

      // Preserve only previously created categories that actually have references
      if (oldCategories && oldCategories.length > 0) {
        for (const cat of oldCategories) {
          const lowerName = cat.name.toLowerCase().trim();
          const exists = merged.some(
            (c) => c.id === cat.id || c.name.toLowerCase() === lowerName
          );
          if (!exists && populatedCatNames.has(lowerName)) {
            merged.push(cat);
          }
        }
      }

      this.setInStorage(STORAGE_KEYS.CATEGORIES, merged);
      this.setInStorage(STORAGE_KEYS.PRUNE_EMPTY_CATS_V1, 'done');
      return merged;
    }

    // Ensure PRÉVIAS and the 4 independent categories remain present
    let changed = false;
    let result = [...saved];

    // Remove built-in empty categories and run one-time cleanup of any empty cached categories
    const filtered = result.filter((c) => {
      const lower = c.name.toLowerCase().trim();
      if (lower === 'todas') return true;
      if (populatedCatNames.has(lower)) return true;
      if (pruneDone && c.isCustom) return true;
      return false;
    });
    if (filtered.length !== result.length) {
      result = filtered;
      changed = true;
    }

    if (!result.some((c) => c.name.toLowerCase() === 'prévia' || c.name.toLowerCase() === 'prévias')) {
      const todasIdx = result.findIndex((c) => c.name.toLowerCase() === 'todas');
      result.splice(todasIdx >= 0 ? todasIdx + 1 : 0, 0, { id: 'previas', name: 'PRÉVIAS' });
      changed = true;
    }

    const requiredFour: Category[] = [
      { id: 'aniversario-feminino', name: 'Aniversário Feminino' },
      { id: 'aniversario-gospel-evangelico', name: 'Aniversário Gospel Evangélico' },
      { id: 'profissional-feminino', name: 'Profissional Feminino' },
      { id: 'ensaio-masculino-adulto', name: 'Ensaio Masculino Adulto' },
    ];

    for (const reqCat of requiredFour) {
      if (!result.some((c) => c.name.toLowerCase() === reqCat.name.toLowerCase())) {
        const previasIdx = result.findIndex((c) => c.name.toLowerCase() === 'prévias');
        const insertAfter = previasIdx >= 0 ? previasIdx + 1 : 1;
        result.splice(insertAfter, 0, reqCat);
        changed = true;
      }
    }

    // Ensure the 4 required categories appear right after PRÉVIAS
    const previasIdx = result.findIndex((c) => c.name.toLowerCase() === 'prévias');
    if (previasIdx >= 0) {
      const targetOrder = requiredFour.map((c) => c.name.toLowerCase());
      const currentSlice = result
        .slice(previasIdx + 1, previasIdx + 1 + requiredFour.length)
        .map((c) => c.name.toLowerCase());
      const needsReorder = targetOrder.some((name, idx) => currentSlice[idx] !== name);
      if (needsReorder) {
        const extracted: Category[] = [];
        result = result.filter((c) => {
          const match = requiredFour.find((req) => req.name.toLowerCase() === c.name.toLowerCase());
          if (match) {
            extracted.push({ ...c, id: match.id, name: match.name });
            return false;
          }
          return true;
        });
        const orderedFour = requiredFour.map(
          (req) => extracted.find((e) => e.name.toLowerCase() === req.name.toLowerCase()) || req
        );
        const newPreviasIdx = result.findIndex((c) => c.name.toLowerCase() === 'prévias');
        result.splice(newPreviasIdx + 1, 0, ...orderedFour);
        changed = true;
      }
    }

    for (const defCat of DEFAULT_CATEGORIES) {
      if (!result.some((c) => c.name.toLowerCase() === defCat.name.toLowerCase())) {
        result.push(defCat);
        changed = true;
      }
    }

    if (changed) {
      this.setInStorage(STORAGE_KEYS.CATEGORIES, result);
    }
    if (!pruneDone) {
      this.setInStorage(STORAGE_KEYS.PRUNE_EMPTY_CATS_V1, 'done');
    }

    return result;
  }

  addCategory(name: string): Category {
    const trimmed = name.trim();
    const current = this.getCategories();
    const existing = current.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      isCustom: true,
    };
    const updated = [...current, newCategory];
    this.setInStorage(STORAGE_KEYS.CATEGORIES, updated);
    return newCategory;
  }

  deleteCategory(id: string): boolean {
    const current = this.getCategories();
    const category = current.find((c) => c.id === id);
    if (!category || !category.isCustom) return false;
    const filtered = current.filter((c) => c.id !== id);
    this.setInStorage(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }

  // --- AUTHENTICATION ---
  isAdmin(): boolean {
    return this.getFromStorage<boolean>(STORAGE_KEYS.ADMIN_AUTH, false);
  }

  login(pin: string): boolean {
    const storedPin = this.getFromStorage<string>(
      STORAGE_KEYS.ADMIN_PIN,
      DEFAULT_ADMIN_PIN
    );
    if (pin === storedPin) {
      this.setInStorage(STORAGE_KEYS.ADMIN_AUTH, true);
      return true;
    }
    return false;
  }

  logout(): void {
    this.setInStorage(STORAGE_KEYS.ADMIN_AUTH, false);
  }

  setNewAdminPin(newPin: string): void {
    this.setInStorage(STORAGE_KEYS.ADMIN_PIN, newPin);
  }

  // --- SUPABASE CONFIG ---
  getSupabaseConfig(): SupabaseConfig {
    return this.getFromStorage<SupabaseConfig>(STORAGE_KEYS.SUPABASE_CONFIG, {
      url: '',
      anonKey: '',
      autoSync: false,
    });
  }

  saveSupabaseConfig(config: SupabaseConfig): void {
    this.setInStorage(STORAGE_KEYS.SUPABASE_CONFIG, config);
  }

  // --- BACKUP & RESTORE ---
  exportBackup(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      references: this.getReferences(),
      categories: this.getCategories(),
    };
    return JSON.stringify(data, null, 2);
  }

  importBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.references || !Array.isArray(parsed.references)) {
        return { success: false, count: 0, error: 'Arquivo de backup inválido: lista de referências ausente.' };
      }
      this.setInStorage(STORAGE_KEYS.REFERENCES, parsed.references);
      if (parsed.categories && Array.isArray(parsed.categories)) {
        this.setInStorage(STORAGE_KEYS.CATEGORIES, parsed.categories);
      }
      return { success: true, count: parsed.references.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Erro ao processar JSON de backup.' };
    }
  }

  resetToDefault(): void {
    this.setInStorage(STORAGE_KEYS.REFERENCES, INITIAL_REFERENCES);
    this.setInStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }
}

export const storageService = new StorageService();
