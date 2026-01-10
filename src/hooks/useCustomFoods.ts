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

  return {
    customFoods,
    addCustomFood,
    removeCustomFood,
    updateCustomFood,
  };
}
