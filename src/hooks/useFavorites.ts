import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { isValidFavoriteEntry, FavoriteEntry } from "@/lib/validation";

export type { FavoriteEntry };

const STORAGE_KEY = "favorite_recipes_data";

// Safe parse with validation
function safeLoadFavorites(): FavoriteEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    
    // Filter only valid entries
    return parsed.filter(isValidFavoriteEntry);
  } catch {
    console.warn('Failed to parse favorites from localStorage');
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    const loaded = safeLoadFavorites();
    setFavorites(loaded);
  }, []);

  const addFavorite = useCallback((recipe: Recipe) => {
    const entry: FavoriteEntry = {
      id: recipe.id || crypto.randomUUID(),
      timestamp: Date.now(),
      recipe,
    };

    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((f) => f.recipe.nama === recipe.nama)) {
        return prev;
      }
      const updated = [entry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (recipeName: string) => {
      return favorites.some((f) => f.recipe.nama === recipeName);
    },
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites };
}
