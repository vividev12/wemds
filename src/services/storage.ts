import { PhotoReference, Category, SupabaseConfig } from '../types';
import { SEED_PROMPTS } from '../data/seedPrompts';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'todas', name: 'Todas' },
  { id: 'aniversario', name: 'Aniversário' },
  { id: 'casais', name: 'Casais' },
  { id: 'profissional', name: 'Profissional' },
  { id: 'casual', name: 'Casual' },
  { id: 'gestante', name: 'Gestante' },
  { id: 'sensual', name: 'Sensual' },
  { id: 'religioso', name: 'Religioso' },
  { id: 'feminino', name: 'Feminino' },
  { id: 'masculino', name: 'Masculino' },
  { id: 'formatura', name: 'Formatura' },
  { id: 'familia', name: 'Família' },
  { id: 'infantil', name: 'Infantil' },
  { id: 'outros', name: 'Outros' },
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
  REFERENCES: 'wemedia_references_v6',
  CATEGORIES: 'wemedia_categories_v2',
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
      // Check previous storage versions to preserve user custom entries
      const oldRefs =
        this.getFromStorage<PhotoReference[]>('wemedia_references_v5', []) ||
        this.getFromStorage<PhotoReference[]>('wemedia_references_v4', []) ||
        this.getFromStorage<PhotoReference[]>('wemedia_references_v3', []);

      if (oldRefs && oldRefs.length > 0) {
        refs = oldRefs.map((r) => {
          let updated = { ...r };
          if (r.id === 'ref-1' || r.title === 'Profissional Masculino') {
            updated = { ...updated, imageUrl: 'https://i.imgur.com/0alVVQK.jpeg', originalImage: 'https://i.imgur.com/0alVVQK.jpeg' };
          }
          if ((r.id === 'ref-2' || r.title === 'Aniversário Marrom') && seedAniver) {
            updated = { ...updated, prompt: seedAniver.prompt };
          }
          return updated;
        });
      } else {
        refs = INITIAL_REFERENCES;
      }
      this.setInStorage(STORAGE_KEYS.REFERENCES, refs);
      return refs;
    }

    // Ensure models are updated in existing storage cache
    let hasUpdated = false;
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
      return updated;
    });
    if (hasUpdated) {
      this.setInStorage(STORAGE_KEYS.REFERENCES, refs);
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
    const saved = this.getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!saved || saved.length === 0) {
      this.setInStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return saved;
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
