import { useState, useEffect, useCallback } from "react";
import { RecipeResponse } from "@/types/recipe";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  data: RecipeResponse;
  query?: string;
}

const STORAGE_KEY = "recipe_history";
const MAX_HISTORY = 20;

export function useRecipeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
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
