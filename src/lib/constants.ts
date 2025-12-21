import { DietaryRestriction, CuisineType } from "@/types/recipe";

export const DIETARY_OPTIONS: DietaryRestriction[] = [
  { id: "halal", label: "Halal", icon: "🕌" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "no-pork", label: "Tanpa Babi", icon: "🚫🐷" },
  { id: "no-seafood", label: "Tanpa Seafood", icon: "🚫🦐" },
  { id: "gluten-free", label: "Bebas Gluten", icon: "🌾" },
  { id: "dairy-free", label: "Tanpa Susu", icon: "🥛" },
  { id: "low-sugar", label: "Rendah Gula", icon: "🍬" },
  { id: "low-sodium", label: "Rendah Garam", icon: "🧂" },
];

export const CUISINE_OPTIONS: CuisineType[] = [
  { id: "indonesia", label: "🇮🇩 Indonesia" },
  { id: "jawa", label: "Jawa" },
  { id: "sunda", label: "Sunda" },
  { id: "padang", label: "Padang" },
  { id: "chinese", label: "🇨🇳 Chinese" },
  { id: "western", label: "🍔 Western" },
  { id: "japanese", label: "🇯🇵 Jepang" },
  { id: "korean", label: "🇰🇷 Korea" },
  { id: "thai", label: "🇹🇭 Thailand" },
  { id: "indian", label: "🇮🇳 India" },
  { id: "middle-eastern", label: "🥙 Timur Tengah" },
];

export const DIFFICULTY_OPTIONS = [
  { id: "mudah", label: "Mudah", desc: "Cocok untuk pemula" },
  { id: "sedang", label: "Sedang", desc: "Butuh sedikit skill" },
  { id: "sulit", label: "Sulit", desc: "Chef profesional" },
];

export const TIME_OPTIONS = [
  { id: "15", label: "< 15 menit", icon: "⚡" },
  { id: "30", label: "15-30 menit", icon: "🕐" },
  { id: "60", label: "30-60 menit", icon: "🕑" },
  { id: "unlimited", label: "Bebas waktu", icon: "♾️" },
];
