import { useState, useEffect, useCallback } from "react";
import { WeeklyMealPlan, MealSlot, MealTime, DAYS, MEAL_TIMES } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "weekly_meal_plan";

const generateSlotId = (dayIndex: number, mealTime: MealTime) => 
  `${dayIndex}-${mealTime}`;

const createEmptySlots = (): MealSlot[] => {
  const slots: MealSlot[] = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (const { key } of MEAL_TIMES) {
      slots.push({
        id: generateSlotId(dayIndex, key),
        dayIndex,
        mealTime: key,
        recipe: null,
        isLocked: false,
        isSkipped: false,
      });
    }
  }
  return slots;
};

const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

export const useMealPlan = () => {
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WeeklyMealPlan;
        // Check if it's still current week
        const currentWeekStart = getWeekStart();
        if (parsed.weekStart === currentWeekStart) {
          setMealPlan(parsed);
        } else {
          // Old week, create new empty plan
          const newPlan: WeeklyMealPlan = {
            id: crypto.randomUUID(),
            weekStart: currentWeekStart,
            slots: createEmptySlots(),
            generatedAt: "",
          };
          setMealPlan(newPlan);
        }
      } catch {
        // Invalid data, create new
        const newPlan: WeeklyMealPlan = {
          id: crypto.randomUUID(),
          weekStart: getWeekStart(),
          slots: createEmptySlots(),
          generatedAt: "",
        };
        setMealPlan(newPlan);
      }
    } else {
      // No saved plan
      const newPlan: WeeklyMealPlan = {
        id: crypto.randomUUID(),
        weekStart: getWeekStart(),
        slots: createEmptySlots(),
        generatedAt: "",
      };
      setMealPlan(newPlan);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mealPlan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mealPlan));
    }
  }, [mealPlan]);

  const updateSlot = useCallback((slotId: string, recipe: Recipe | null) => {
    setMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: prev.slots.map(slot =>
          slot.id === slotId ? { ...slot, recipe } : slot
        ),
      };
    });
  }, []);

  const toggleLock = useCallback((slotId: string) => {
    setMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: prev.slots.map(slot =>
          slot.id === slotId ? { ...slot, isLocked: !slot.isLocked } : slot
        ),
      };
    });
  }, []);

  const toggleSkip = useCallback((slotId: string) => {
    setMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: prev.slots.map(slot =>
          slot.id === slotId ? { ...slot, isSkipped: !slot.isSkipped, recipe: slot.isSkipped ? slot.recipe : null } : slot
        ),
      };
    });
  }, []);

  const setSlots = useCallback((newSlots: MealSlot[]) => {
    setMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: newSlots,
        generatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const clearPlan = useCallback(() => {
    setMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: prev.slots.map(slot => ({
          ...slot,
          recipe: slot.isLocked ? slot.recipe : null,
          isSkipped: false,
        })),
        generatedAt: "",
      };
    });
  }, []);

  const getSlot = useCallback((dayIndex: number, mealTime: MealTime): MealSlot | undefined => {
    return mealPlan?.slots.find(
      slot => slot.dayIndex === dayIndex && slot.mealTime === mealTime
    );
  }, [mealPlan]);

  const getFilledSlots = useCallback((): MealSlot[] => {
    return mealPlan?.slots.filter(slot => slot.recipe && !slot.isSkipped) || [];
  }, [mealPlan]);

  const getExistingRecipeNames = useCallback((): string[] => {
    return mealPlan?.slots
      .filter(slot => slot.recipe && slot.isLocked)
      .map(slot => slot.recipe!.nama) || [];
  }, [mealPlan]);

  return {
    mealPlan,
    isLoading,
    setIsLoading,
    updateSlot,
    toggleLock,
    toggleSkip,
    setSlots,
    clearPlan,
    getSlot,
    getFilledSlots,
    getExistingRecipeNames,
  };
};
