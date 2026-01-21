import { useState, useEffect, useCallback } from "react";
import { RecipeResponse } from "@/types/recipe";
import { isValidHistoryEntry, HistoryEntry } from "@/lib/validation";

export type { HistoryEntry };

const STORAGE_KEY = "recipe_history";
const MAX_HISTORY = 20;

// Safe parse with validation
function safeLoadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    
    // Filter only valid entries
    return parsed.filter(isValidHistoryEntry);
  } catch {
    console.warn('Failed to parse history from localStorage');
    return [];
  }
}

export function useRecipeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const loaded = safeLoadHistory();
    setHistory(loaded);
  }, []);

  const saveToHistory = useCallback((data: RecipeResponse, query?: string) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data,
      query,
    };

    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, saveToHistory, removeFromHistory, clearHistory };
}
