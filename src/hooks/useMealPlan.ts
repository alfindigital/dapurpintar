import { useState, useEffect, useCallback, useRef } from "react";
import { WeeklyMealPlan, MealSlot, MealTime, MealPlanTemplate, MEAL_TIMES } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "weekly_meal_plan";
const TEMPLATES_KEY = "meal_plan_templates";
const MAX_HISTORY_SIZE = 20;

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
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Undo/Redo history
  const [history, setHistory] = useState<MealSlot[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch {
        setTemplates([]);
      }
    }
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

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
          // Initialize history with current state
          setHistory([parsed.slots]);
          setHistoryIndex(0);
        } else {
          // Old week, create new empty plan
          const newPlan: WeeklyMealPlan = {
            id: crypto.randomUUID(),
            weekStart: currentWeekStart,
            slots: createEmptySlots(),
            generatedAt: "",
          };
          setMealPlan(newPlan);
          setHistory([newPlan.slots]);
          setHistoryIndex(0);
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
        setHistory([newPlan.slots]);
        setHistoryIndex(0);
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
      setHistory([newPlan.slots]);
      setHistoryIndex(0);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mealPlan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mealPlan));
    }
  }, [mealPlan]);

  // Track changes for undo/redo (only when not doing undo/redo)
  useEffect(() => {
    if (mealPlan && !isUndoRedoAction.current) {
      const currentSlots = JSON.stringify(mealPlan.slots);
      const lastHistorySlots = history[historyIndex] ? JSON.stringify(history[historyIndex]) : null;
      
      if (currentSlots !== lastHistorySlots) {
        // New change, add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(mealPlan.slots);
        
        // Limit history size
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
    isUndoRedoAction.current = false;
  }, [mealPlan?.slots]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo || !mealPlan) return false;
    
    isUndoRedoAction.current = true;
    const newIndex = historyIndex - 1;
    const previousSlots = history[newIndex];
    
    setHistoryIndex(newIndex);
    setMealPlan(prev => prev ? {
      ...prev,
      slots: previousSlots,
    } : prev);
    
    return true;
  }, [canUndo, historyIndex, history, mealPlan]);

  const redo = useCallback(() => {
    if (!canRedo || !mealPlan) return false;
    
    isUndoRedoAction.current = true;
    const newIndex = historyIndex + 1;
    const nextSlots = history[newIndex];
    
    setHistoryIndex(newIndex);
    setMealPlan(prev => prev ? {
      ...prev,
      slots: nextSlots,
    } : prev);
    
    return true;
  }, [canRedo, historyIndex, history, mealPlan]);

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

  // Template functions
  const saveAsTemplate = useCallback((name: string, description?: string) => {
    if (!mealPlan) return null;
    
    const slotsWithRecipes = mealPlan.slots.filter(s => s.recipe);
    if (slotsWithRecipes.length === 0) return null;

    const template: MealPlanTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      slots: mealPlan.slots.map(slot => ({
        ...slot,
        isLocked: false,
        isSkipped: false,
      })),
      createdAt: new Date().toISOString(),
    };

    setTemplates(prev => [template, ...prev]);
    return template;
  }, [mealPlan]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || !mealPlan) return false;

    const newSlots = mealPlan.slots.map(currentSlot => {
      const templateSlot = template.slots.find(
        ts => ts.dayIndex === currentSlot.dayIndex && ts.mealTime === currentSlot.mealTime
      );
      if (templateSlot?.recipe) {
        return {
          ...currentSlot,
          recipe: templateSlot.recipe,
          isLocked: false,
          isSkipped: false,
        };
      }
      return currentSlot;
    });

    setMealPlan(prev => prev ? {
      ...prev,
      slots: newSlots,
      generatedAt: new Date().toISOString(),
    } : prev);

    return true;
  }, [templates, mealPlan]);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const renameTemplate = useCallback((templateId: string, newName: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, name: newName } : t
    ));
  }, []);

  const swapSlots = useCallback((slotId1: string, slotId2: string) => {
    setMealPlan(prev => {
      if (!prev) return prev;
      
      const slot1 = prev.slots.find(s => s.id === slotId1);
      const slot2 = prev.slots.find(s => s.id === slotId2);
      
      if (!slot1 || !slot2) return prev;
      
      return {
        ...prev,
        slots: prev.slots.map(slot => {
          if (slot.id === slotId1) {
            return {
              ...slot,
              recipe: slot2.recipe,
              isLocked: slot2.isLocked,
              isSkipped: slot2.isSkipped,
            };
          }
          if (slot.id === slotId2) {
            return {
              ...slot,
              recipe: slot1.recipe,
              isLocked: slot1.isLocked,
              isSkipped: slot1.isSkipped,
            };
          }
          return slot;
        }),
      };
    });
  }, []);

  return {
    mealPlan,
    templates,
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
    saveAsTemplate,
    applyTemplate,
    deleteTemplate,
    renameTemplate,
    swapSlots,
    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,
  };
};
