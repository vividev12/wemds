export interface PhotoReference {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  originalImage?: string;
  originalTitle?: string;
  prompt: string;
  aspectRatio?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'favorites';
