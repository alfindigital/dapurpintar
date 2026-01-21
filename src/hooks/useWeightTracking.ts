import { useState, useEffect, useCallback } from 'react';
import { isValidWeightEntry, WeightEntry } from '@/lib/validation';

export type { WeightEntry };

const STORAGE_KEY = 'weight_tracking';

// Safe loader
function safeLoadWeightEntries(): WeightEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidWeightEntry);
  } catch {
    console.warn('Failed to parse weight tracking data');
    return [];
  }
}

export function useWeightTracking() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage with validation
  useEffect(() => {
    const loaded = safeLoadWeightEntries();
    setEntries(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const addEntry = useCallback((weight: number, note?: string, date?: string) => {
    const newEntry: WeightEntry = {
      id: crypto.randomUUID(),
      date: date || new Date().toISOString().split('T')[0],
      weight,
      note,
    };
    setEntries(prev => {
      // Check if entry for this date exists
      const existingIndex = prev.findIndex(e => e.date === newEntry.date);
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        return updated.sort((a, b) => a.date.localeCompare(b.date));
      }
      return [...prev, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
  }, []);

  // Get last 30 days of data for chart
  const getLast30Days = useCallback(() => {
    const today = new Date();
    const data: { date: string; day: string; weight: number | null }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateKey);
      
      data.push({
        date: dateKey,
        day: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        weight: entry?.weight || null,
      });
    }
    
    return data;
  }, [entries]);

  // Calculate stats
  const getStats = useCallback(() => {
    if (entries.length === 0) {
      return { current: null, initial: null, change: null, trend: 'stable' as const };
    }

    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const initial = sorted[0].weight;
    const current = sorted[sorted.length - 1].weight;
    const change = current - initial;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 0.5) trend = 'up';
    else if (change < -0.5) trend = 'down';

    return { current, initial, change, trend };
  }, [entries]);

  return {
    entries,
    isLoaded,
    addEntry,
    removeEntry,
    clearAll,
    getLast30Days,
    getStats,
  };
}
