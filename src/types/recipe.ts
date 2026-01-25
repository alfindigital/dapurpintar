export interface Nutrition {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
}

export interface Recipe {
  id: string;
  nama: string;
  deskripsi: string;
  waktu: string;
  porsi: string;
  tingkatKesulitan: "Mudah" | "Sedang" | "Sulit";
  bahan: Ingredient[];
  langkah: string[];
  tips?: string;
  masakan?: string;
  tags?: string[];
  nutrisi?: Nutrition;
  estimasiBiaya?: number; // Estimasi biaya dalam Rupiah
}

export interface Ingredient {
  item: string;
  jumlah: string;
  catatan?: string;
}

export interface RecipeResponse {
  recipes: Recipe[];
  tips?: string[];
  substitusi?: string[];
}

export interface DietaryRestriction {
  id: string;
  label: string;
  icon: string;
}

export interface CuisineType {
  id: string;
  label: string;
}

export type MealGoal = "hemat" | "diet" | "bulking" | "seimbang";

export interface Preferences {
  dietary: string[];
  cuisine: string[];
  difficulty: string;
  time: string;
  mealGoal?: MealGoal;
}
