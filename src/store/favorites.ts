export const FAVORITES_STORAGE_KEY = "danial_cn_favorites_v1";

export type FavoriteItem = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  priceLabel: string;
  coverUrl: string;
  addedAt: string;
};

export function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items: FavoriteItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("danial-favorites-updated"));
}

export function isFavorite(productId: string): boolean {
  return loadFavorites().some((f) => f.productId === productId);
}

export function toggleFavorite(item: FavoriteItem): FavoriteItem[] {
  const items = loadFavorites();
  const idx = items.findIndex((f) => f.productId === item.productId);
  if (idx >= 0) {
    items.splice(idx, 1);
  } else {
    items.unshift(item);
  }
  saveFavorites(items);
  return items;
}

export function removeFavorite(productId: string): FavoriteItem[] {
  const next = loadFavorites().filter((f) => f.productId !== productId);
  saveFavorites(next);
  return next;
}
