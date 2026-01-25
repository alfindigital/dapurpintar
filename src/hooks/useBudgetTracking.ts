import { useState, useEffect, useCallback, useMemo } from "react";
import { MealSlot, BudgetEntry, BudgetSettings, DEFAULT_BUDGET_SETTINGS, KategoriBiaya } from "@/types/mealPlan";
import { isValidBudgetEntry, isValidBudgetSettings } from "@/lib/validation";

const BUDGET_HISTORY_KEY = "budget_history";
const BUDGET_SETTINGS_KEY = "budget_settings";
const MAX_HISTORY_WEEKS = 8;

function safeLoadBudgetHistory(): BudgetEntry[] {
  try {
    const stored = localStorage.getItem(BUDGET_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidBudgetEntry);
  } catch {
    return [];
  }
}

function safeLoadBudgetSettings(): BudgetSettings {
  try {
    const stored = localStorage.getItem(BUDGET_SETTINGS_KEY);
    if (!stored) return DEFAULT_BUDGET_SETTINGS;
    const parsed = JSON.parse(stored);
    if (!isValidBudgetSettings(parsed)) return DEFAULT_BUDGET_SETTINGS;
    return parsed;
  } catch {
    return DEFAULT_BUDGET_SETTINGS;
  }
}

// Estimate cost category based on ingredient name
function categorizeIngredient(item: string): KategoriBiaya {
  const lower = item.toLowerCase();
  
  // Protein
  if (/ayam|daging|sapi|ikan|udang|telur|tahu|tempe|cumi|kepiting|kerang|bebek|kambing|babi/.test(lower)) {
    return "protein";
  }
  
  // Vegetables
  if (/sayur|bayam|kangkung|wortel|tomat|buncis|terong|labu|kubis|kol|sawi|brokoli|timun|mentimun|paprika|jamur|jagung|kentang|selada|pare|daun/.test(lower)) {
    return "sayuran";
  }
  
  // Carbohydrates
  if (/nasi|beras|mie|mi |pasta|roti|tepung|oat|sereal|ubi|singkong|sagu/.test(lower)) {
    return "karbohidrat";
  }
  
  // Spices/Condiments
  if (/bawang|merica|lada|garam|gula|kecap|saus|sambal|kunyit|jahe|lengkuas|serai|ketumbar|pala|kayu manis|cengkeh|minyak|santan|kaldu|royco|masako/.test(lower)) {
    return "bumbu";
  }
  
  return "lainnya";
}

export const useBudgetTracking = () => {
  const [budgetHistory, setBudgetHistory] = useState<BudgetEntry[]>([]);
  const [settings, setSettings] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setBudgetHistory(safeLoadBudgetHistory());
    setSettings(safeLoadBudgetSettings());
    setIsLoaded(true);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(BUDGET_HISTORY_KEY, JSON.stringify(budgetHistory));
  }, [budgetHistory, isLoaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, isLoaded]);

  // Calculate weekly budget from slots
  const calculateWeeklyBudget = useCallback((slots: MealSlot[], weekStart: string): BudgetEntry => {
    const kategoriBiaya: Record<KategoriBiaya, number> = {
      protein: 0,
      sayuran: 0,
      karbohidrat: 0,
      bumbu: 0,
      lainnya: 0,
    };

    let totalEstimasi = 0;

    for (const slot of slots) {
      if (!slot.recipe || slot.isSkipped) continue;

      const recipeCost = slot.recipe.estimasiBiaya || 0;
      totalEstimasi += recipeCost;

      // Distribute cost by ingredient categories
      if (slot.recipe.bahan && slot.recipe.bahan.length > 0) {
        const ingredientCount = slot.recipe.bahan.length;
        const costPerIngredient = recipeCost / ingredientCount;

        for (const bahan of slot.recipe.bahan) {
          const category = categorizeIngredient(bahan.item);
          kategoriBiaya[category] += costPerIngredient;
        }
      } else {
        // If no ingredients, put all in "lainnya"
        kategoriBiaya.lainnya += recipeCost;
      }
    }

    return {
      id: crypto.randomUUID(),
      weekStart,
      totalEstimasi: Math.round(totalEstimasi),
      targetBudget: settings.budgetBulanan ? Math.round(settings.budgetBulanan / 4) : undefined,
      kategoriBiaya: {
        protein: Math.round(kategoriBiaya.protein),
        sayuran: Math.round(kategoriBiaya.sayuran),
        karbohidrat: Math.round(kategoriBiaya.karbohidrat),
        bumbu: Math.round(kategoriBiaya.bumbu),
        lainnya: Math.round(kategoriBiaya.lainnya),
      },
    };
  }, [settings.budgetBulanan]);

  // Save weekly budget to history
  const saveWeeklyBudget = useCallback((entry: BudgetEntry) => {
    setBudgetHistory(prev => {
      // Replace if same week exists
      const existingIndex = prev.findIndex(e => e.weekStart === entry.weekStart);
      let updated: BudgetEntry[];
      
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = entry;
      } else {
        updated = [entry, ...prev];
      }
      
      // Keep only last N weeks
      return updated.slice(0, MAX_HISTORY_WEEKS);
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<BudgetSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get current week's budget entry
  const getCurrentWeekBudget = useCallback((weekStart: string): BudgetEntry | undefined => {
    return budgetHistory.find(e => e.weekStart === weekStart);
  }, [budgetHistory]);

  // Calculate monthly total from history
  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return budgetHistory
      .filter(entry => new Date(entry.weekStart) >= startOfMonth)
      .reduce((sum, entry) => sum + entry.totalEstimasi, 0);
  }, [budgetHistory]);

  // Check if over budget
  const alertStatus = useMemo(() => {
    if (!settings.enableAlerts || !settings.budgetBulanan) {
      return { isWarning: false, isOver: false, percentage: 0 };
    }

    const percentage = (monthlyTotal / settings.budgetBulanan) * 100;
    
    return {
      isWarning: percentage >= settings.alertThreshold && percentage < 100,
      isOver: percentage >= 100,
      percentage: Math.round(percentage),
    };
  }, [monthlyTotal, settings.budgetBulanan, settings.alertThreshold, settings.enableAlerts]);

  // Get category breakdown for current month
  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totals: Record<KategoriBiaya, number> = {
      protein: 0,
      sayuran: 0,
      karbohidrat: 0,
      bumbu: 0,
      lainnya: 0,
    };

    budgetHistory
      .filter(entry => new Date(entry.weekStart) >= startOfMonth)
      .forEach(entry => {
        Object.keys(entry.kategoriBiaya).forEach(key => {
          totals[key as KategoriBiaya] += entry.kategoriBiaya[key as KategoriBiaya];
        });
      });

    return totals;
  }, [budgetHistory]);

  return {
    budgetHistory,
    settings,
    updateSettings,
    calculateWeeklyBudget,
    saveWeeklyBudget,
    getCurrentWeekBudget,
    monthlyTotal,
    alertStatus,
    categoryBreakdown,
    isLoaded,
  };
};
