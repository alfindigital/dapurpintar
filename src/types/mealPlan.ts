import { Recipe, Nutrition } from "./recipe";

export type MealTime = "sarapan" | "makan_siang" | "makan_malam";

export interface MealSlot {
  id: string;
  dayIndex: number; // 0-6 (Senin-Minggu)
  mealTime: MealTime;
  recipe: Recipe | null;
  isLocked: boolean;
  isSkipped: boolean;
}

export interface WeeklyMealPlan {
  id: string;
  weekStart: string; // ISO date string
  slots: MealSlot[];
  generatedAt: string;
  totalNutrisi?: Nutrition;
}

export type MealGoal = "hemat" | "diet" | "bulking" | "seimbang";
export type TingkatKesulitan = "mudah" | "sedang" | "sulit";

export interface MealPlanPreferences {
  includeSarapan: boolean;
  includeMakanSiang: boolean;
  includeMakanMalam: boolean;
  prioritasDaerah: boolean;
  variasi: "tinggi" | "sedang" | "rendah";
  budgetHarian?: number;
  mealGoal: MealGoal;
  tingkatKesulitan?: TingkatKesulitan;
}

export interface ShoppingItem {
  item: string;
  jumlah: string;
  kategori: string;
  recipes: string[]; // nama resep yang butuh bahan ini
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  description?: string;
  slots: MealSlot[];
  createdAt: string;
}

export const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export const MEAL_TIMES: { key: MealTime; label: string }[] = [
  { key: "sarapan", label: "Sarapan" },
  { key: "makan_siang", label: "Makan Siang" },
  { key: "makan_malam", label: "Makan Malam" },
];

export const DEFAULT_MEAL_PREFERENCES: MealPlanPreferences = {
  includeSarapan: true,
  includeMakanSiang: true,
  includeMakanMalam: true,
  prioritasDaerah: true,
  variasi: "tinggi",
  budgetHarian: undefined,
  mealGoal: "seimbang",
  tingkatKesulitan: undefined,
};
