import { CuisineType } from "@/types/recipe";

export const CUISINE_OPTIONS: CuisineType[] = [
  { id: "indonesia", label: "Indonesia" },
  { id: "western", label: "Western" },
  { id: "chinese", label: "Chinese" },
  { id: "middle-eastern", label: "Timur Tengah" },
  { id: "others", label: "Lainnya" },
];

export const TIME_OPTIONS = [
  { id: "cepat", label: "<30 min", icon: "", desc: "" },
  { id: "lama", label: ">30 min", icon: "", desc: "" },
];

export const MEAL_GOAL_OPTIONS = [
  { id: "hemat", label: "Hemat", desc: "Budget minimal" },
  { id: "diet", label: "Diet", desc: "Rendah kalori" },
  { id: "bulking", label: "Bulking", desc: "Massa otot" },
  { id: "seimbang", label: "Seimbang", desc: "Keluarga" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { id: "mudah", label: "Mudah", icon: "", desc: "" },
  { id: "sedang", label: "Sedang", icon: "", desc: "" },
  { id: "sulit", label: "Sulit", icon: "", desc: "" },
] as const;

export const BUDGET_PRESETS = [
  { value: 30000, label: "30rb" },
  { value: 50000, label: "50rb" },
  { value: 75000, label: "75rb" },
  { value: 100000, label: "100rb" },
] as const;
