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

// Validate a single history entry
function isValidHistoryEntry(entry: unknown): entry is HistoryEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.timestamp === 'number' &&
    e.data !== null &&
    typeof e.data === 'object'
  );
}

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
