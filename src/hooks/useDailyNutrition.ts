import { useState, useEffect, useCallback } from 'react';

export interface NutritionEntry {
  id: string;
  nama: string;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  waktu: string;
  timestamp: number;
}

export interface DailyNutrition {
  date: string;
  entries: NutritionEntry[];
  totalKalori: number;
  totalProtein: number;
  totalKarbohidrat: number;
  totalLemak: number;
}

const STORAGE_KEY = 'daily_nutrition';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function useDailyNutrition() {
  const [dailyData, setDailyData] = useState<DailyNutrition>({
    date: getTodayKey(),
    entries: [],
    totalKalori: 0,
    totalProtein: 0,
    totalKarbohidrat: 0,
    totalLemak: 0,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, DailyNutrition>;
        const today = getTodayKey();
        if (parsed[today]) {
          setDailyData(parsed[today]);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((data: DailyNutrition) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let allData: Record<string, DailyNutrition> = {};
    if (saved) {
      try {
        allData = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    allData[data.date] = data;
    
    // Keep only last 7 days
    const dates = Object.keys(allData).sort().reverse().slice(0, 7);
    const filtered: Record<string, DailyNutrition> = {};
    dates.forEach(d => {
      filtered[d] = allData[d];
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }, []);

  const recalculateTotals = useCallback((entries: NutritionEntry[]): DailyNutrition => {
    return {
      date: getTodayKey(),
      entries,
      totalKalori: entries.reduce((sum, e) => sum + e.kalori, 0),
      totalProtein: entries.reduce((sum, e) => sum + e.protein, 0),
      totalKarbohidrat: entries.reduce((sum, e) => sum + e.karbohidrat, 0),
      totalLemak: entries.reduce((sum, e) => sum + e.lemak, 0),
    };
  }, []);

  const addEntry = useCallback((entry: Omit<NutritionEntry, 'id' | 'timestamp'>) => {
    const newEntry: NutritionEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    setDailyData(prev => {
      const today = getTodayKey();
      const entries = prev.date === today 
        ? [...prev.entries, newEntry]
        : [newEntry];
      const updated = recalculateTotals(entries);
      saveToStorage(updated);
      return updated;
    });
  }, [recalculateTotals, saveToStorage]);

  const removeEntry = useCallback((id: string) => {
    setDailyData(prev => {
      const entries = prev.entries.filter(e => e.id !== id);
      const updated = recalculateTotals(entries);
      saveToStorage(updated);
      return updated;
    });
  }, [recalculateTotals, saveToStorage]);

  const clearToday = useCallback(() => {
    const cleared = recalculateTotals([]);
    setDailyData(cleared);
    saveToStorage(cleared);
  }, [recalculateTotals, saveToStorage]);

  return {
    dailyData,
    addEntry,
    removeEntry,
    clearToday,
  };
}
