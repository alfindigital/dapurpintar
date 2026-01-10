import { useState, useEffect, useCallback } from 'react';
import { QuickFood } from '@/lib/quickFoodsData';

const STORAGE_KEY = 'custom_foods';

export interface CustomFood extends QuickFood {
  isCustom: true;
  createdAt: number;
}

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CustomFood[];
        setCustomFoods(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((foods: CustomFood[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
  }, []);

  const addCustomFood = useCallback((food: Omit<CustomFood, 'id' | 'isCustom' | 'createdAt'>) => {
    const newFood: CustomFood = {
      ...food,
      id: `custom-${crypto.randomUUID()}`,
      isCustom: true,
      createdAt: Date.now(),
    };
    
    setCustomFoods(prev => {
      const updated = [newFood, ...prev];
      saveToStorage(updated);
      return updated;
    });
    
    return newFood;
  }, [saveToStorage]);

  const removeCustomFood = useCallback((id: string) => {
    setCustomFoods(prev => {
      const updated = prev.filter(f => f.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const updateCustomFood = useCallback((id: string, updates: Partial<Omit<CustomFood, 'id' | 'isCustom' | 'createdAt'>>) => {
    setCustomFoods(prev => {
      const updated = prev.map(f => 
        f.id === id ? { ...f, ...updates } : f
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const exportCustomFoods = useCallback(() => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      foods: customFoods,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makanan-custom-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return customFoods.length;
  }, [customFoods]);

  const importCustomFoods = useCallback((jsonString: string, mode: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      if (!data.foods || !Array.isArray(data.foods)) {
        return { success: false, count: 0, error: 'Format file tidak valid' };
      }
      
      // Validate each food item
      const validFoods: CustomFood[] = [];
      for (const food of data.foods) {
        if (!food.nama || typeof food.kalori !== 'number') {
          continue; // Skip invalid items
        }
        
        validFoods.push({
          id: `custom-${crypto.randomUUID()}`,
          nama: String(food.nama).slice(0, 50),
          kategori: food.kategori || 'lauk',
          kalori: Math.max(0, Number(food.kalori) || 0),
          protein: Math.max(0, Number(food.protein) || 0),
          karbohidrat: Math.max(0, Number(food.karbohidrat) || 0),
          lemak: Math.max(0, Number(food.lemak) || 0),
          porsi: String(food.porsi || '1 porsi').slice(0, 20),
          isCustom: true,
          createdAt: Date.now(),
        });
      }
      
      if (validFoods.length === 0) {
        return { success: false, count: 0, error: 'Tidak ada data makanan valid ditemukan' };
      }
      
      if (mode === 'replace') {
        setCustomFoods(validFoods);
        saveToStorage(validFoods);
      } else {
        // Merge - avoid duplicates by name
        setCustomFoods(prev => {
          const existingNames = new Set(prev.map(f => f.nama.toLowerCase()));
          const newFoods = validFoods.filter(f => !existingNames.has(f.nama.toLowerCase()));
          const updated = [...newFoods, ...prev];
          saveToStorage(updated);
          return updated;
        });
      }
      
      return { success: true, count: validFoods.length };
    } catch {
      return { success: false, count: 0, error: 'File JSON tidak valid' };
    }
  }, [saveToStorage]);

  return {
    customFoods,
    addCustomFood,
    removeCustomFood,
    updateCustomFood,
    exportCustomFoods,
    importCustomFoods,
  };
}
