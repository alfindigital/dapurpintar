import { CuisineType } from "@/types/recipe";

export const CUISINE_OPTIONS: CuisineType[] = [
  { id: "indonesia", label: "🇮🇩 Indonesia" },
  { id: "western", label: "🍔 Western" },
  { id: "chinese", label: "🇨🇳 Chinese" },
  { id: "middle-eastern", label: "🥙 Timur Tengah" },
  { id: "others", label: "🌍 Lainnya" },
];

export const TIME_OPTIONS = [
  { id: "cepat", label: "Cepat", icon: "⚡", desc: "< 30 menit" },
  { id: "sedang", label: "Sedang", icon: "🕐", desc: "30-60 menit" },
  { id: "lama", label: "Lama", icon: "🕑", desc: "> 60 menit" },
];
