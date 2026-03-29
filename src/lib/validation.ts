/**
 * Centralized validation functions for localStorage data.
 * These functions ensure data integrity when loading from storage.
 * 
 * NOTE: Types are imported from their source files to ensure compatibility.
 * This module only provides validation functions, not type definitions.
 */

import type { Recipe } from '@/types/recipe';
import type { MealSlot, MealTime, WeeklyMealPlan, MealPlanTemplate } from '@/types/mealPlan';
import type { FamilyMember, UserProfile } from '@/types/profile';
import type { QuickFood } from '@/lib/quickFoodsData';

// ============= Re-export types that don't have source files =============

export interface FavoriteEntry {
  id: string;
  timestamp: number;
  recipe: Recipe;
}

import type { RecipeResponse } from '@/types/recipe';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  data: RecipeResponse;
  query?: string;
}

export interface CustomFood extends QuickFood {
  isCustom: true;
  createdAt: number;
}

export interface NutritionEntry {
  id: string;
  nama: string;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  waktu: string;
  timestamp: number;
}

export interface DailyNutrition {
  date: string;
  entries: NutritionEntry[];
  totalKalori: number;
  totalProtein: number;
  totalKarbohidrat: number;
  totalLemak: number;
}

export type FontSize = 'small' | 'normal' | 'large';
export type ColorTheme = 'orange' | 'warm' | 'amber' | 'coral';
export type AccessibilityProfile = 'default' | 'lansia' | 'low-vision';

export interface DisplaySettings {
  fontSize: FontSize;
  highContrast: boolean;
  colorTheme: ColorTheme;
  profile: AccessibilityProfile;
}

export interface WaterTrackingData {
  date: string;
  glasses: number;
  timestamps: string[];
}

export interface DailyWaterRecord {
  date: string;
  glasses: number;
  target: number;
}

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  startHour: number;
  endHour: number;
  sound: boolean;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

// ============= Favorites Validation =============

export function isValidFavoriteEntry(entry: unknown): entry is FavoriteEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.timestamp === 'number' &&
    e.recipe !== null &&
    typeof e.recipe === 'object' &&
    typeof (e.recipe as Record<string, unknown>).nama === 'string'
  );
}

// ============= History Validation =============

export function isValidHistoryEntry(entry: unknown): entry is HistoryEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.timestamp === 'number' &&
    e.data !== null &&
    typeof e.data === 'object'
  );
}

// ============= Custom Food Validation =============

const VALID_FOOD_CATEGORIES = ['sarapan', 'lauk', 'nasi', 'mie', 'snack', 'minuman', 'buah', 'sayur'];

export function isValidCustomFood(food: unknown): food is CustomFood {
  if (!food || typeof food !== 'object') return false;
  const f = food as Record<string, unknown>;
  return (
    typeof f.id === 'string' &&
    typeof f.nama === 'string' &&
    typeof f.kategori === 'string' &&
    VALID_FOOD_CATEGORIES.includes(f.kategori as string) &&
    typeof f.kalori === 'number' &&
    typeof f.protein === 'number' &&
    typeof f.karbohidrat === 'number' &&
    typeof f.lemak === 'number' &&
    typeof f.porsi === 'string' &&
    f.isCustom === true &&
    typeof f.createdAt === 'number'
  );
}

// ============= Nutrition Entry Validation =============

export function isValidNutritionEntry(entry: unknown): entry is NutritionEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.nama === 'string' &&
    typeof e.kalori === 'number' &&
    typeof e.protein === 'number' &&
    typeof e.karbohidrat === 'number' &&
    typeof e.lemak === 'number' &&
    typeof e.waktu === 'string' &&
    typeof e.timestamp === 'number'
  );
}

// ============= Daily Nutrition Validation =============

export function isValidDailyNutrition(data: unknown): data is DailyNutrition {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.date === 'string' &&
    Array.isArray(d.entries) &&
    typeof d.totalKalori === 'number' &&
    typeof d.totalProtein === 'number' &&
    typeof d.totalKarbohidrat === 'number' &&
    typeof d.totalLemak === 'number'
  );
}

// ============= User Profile Validation =============

const VALID_KATEGORI_USIA = ['bayi', 'balita', 'anak', 'remaja', 'dewasa', 'lansia'];

export function isValidFamilyMember(member: unknown): member is FamilyMember {
  if (!member || typeof member !== 'object') return false;
  const m = member as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.nama === 'string' &&
    typeof m.hubungan === 'string' &&
    typeof m.usia === 'number' &&
    typeof m.kategoriUsia === 'string' &&
    VALID_KATEGORI_USIA.includes(m.kategoriUsia as string) &&
    Array.isArray(m.kondisiKhusus)
  );
}

export function isValidUserProfile(data: unknown): data is UserProfile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.nama === 'string' &&
    (typeof d.tanggalLahir === 'string' || typeof d.usia === 'number') &&
    typeof d.status === 'string' &&
    Array.isArray(d.anggotaKeluarga)
  );
}

// ============= Display Settings Validation =============

const VALID_FONT_SIZES: FontSize[] = ['small', 'normal', 'large'];
const VALID_COLOR_THEMES: ColorTheme[] = ['orange', 'warm', 'amber', 'coral'];
const VALID_PROFILES: AccessibilityProfile[] = ['default', 'lansia', 'low-vision'];

export function isValidDisplaySettings(data: unknown): data is DisplaySettings {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    VALID_FONT_SIZES.includes(d.fontSize as FontSize) &&
    typeof d.highContrast === 'boolean' &&
    VALID_COLOR_THEMES.includes(d.colorTheme as ColorTheme) &&
    VALID_PROFILES.includes(d.profile as AccessibilityProfile)
  );
}

// ============= Water Tracking Validation =============

export function isValidWaterTrackingData(data: unknown): data is WaterTrackingData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.date === 'string' &&
    typeof d.glasses === 'number' &&
    Array.isArray(d.timestamps) &&
    d.timestamps.every(t => typeof t === 'string')
  );
}

export function isValidDailyWaterRecord(record: unknown): record is DailyWaterRecord {
  if (!record || typeof record !== 'object') return false;
  const r = record as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    typeof r.glasses === 'number' &&
    typeof r.target === 'number'
  );
}

export function isValidStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'string');
}

// ============= Reminder Settings Validation =============

export function isValidReminderSettings(data: unknown): data is ReminderSettings {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.enabled === 'boolean' &&
    typeof d.intervalMinutes === 'number' &&
    typeof d.startHour === 'number' &&
    typeof d.endHour === 'number' &&
    typeof d.sound === 'boolean'
  );
}

// ============= Weight Entry Validation =============

export function isValidWeightEntry(entry: unknown): entry is WeightEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    typeof e.weight === 'number' &&
    (e.note === undefined || typeof e.note === 'string')
  );
}

// ============= Meal Plan Validation =============

const VALID_MEAL_TIMES: MealTime[] = ['sarapan', 'makan_siang', 'makan_malam'];

export function isValidMealSlot(slot: unknown): slot is MealSlot {
  if (!slot || typeof slot !== 'object') return false;
  const s = slot as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.dayIndex === 'number' &&
    VALID_MEAL_TIMES.includes(s.mealTime as MealTime) &&
    (s.recipe === null || (typeof s.recipe === 'object' && s.recipe !== null)) &&
    typeof s.isLocked === 'boolean' &&
    typeof s.isSkipped === 'boolean'
  );
}

export function isValidWeeklyMealPlan(data: unknown): data is WeeklyMealPlan {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.weekStart === 'string' &&
    Array.isArray(d.slots) &&
    d.slots.every(isValidMealSlot) &&
    typeof d.generatedAt === 'string'
  );
}

export function isValidMealPlanTemplate(template: unknown): template is MealPlanTemplate {
  if (!template || typeof template !== 'object') return false;
  const t = template as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    Array.isArray(t.slots) &&
    t.slots.every(isValidMealSlot) &&
    typeof t.createdAt === 'string'
  );
}

// ============= Budget Tracking Validation =============

import type { BudgetEntry, BudgetSettings, KategoriBiaya } from '@/types/mealPlan';

const VALID_BUDGET_CATEGORIES: KategoriBiaya[] = ['protein', 'sayuran', 'karbohidrat', 'bumbu', 'lainnya'];

export function isValidBudgetEntry(entry: unknown): entry is BudgetEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  
  if (
    typeof e.id !== 'string' ||
    typeof e.weekStart !== 'string' ||
    typeof e.totalEstimasi !== 'number'
  ) {
    return false;
  }
  
  // Validate kategoriBiaya
  if (!e.kategoriBiaya || typeof e.kategoriBiaya !== 'object') return false;
  const kb = e.kategoriBiaya as Record<string, unknown>;
  
  for (const cat of VALID_BUDGET_CATEGORIES) {
    if (typeof kb[cat] !== 'number') return false;
  }
  
  return true;
}

export function isValidBudgetSettings(settings: unknown): settings is BudgetSettings {
  if (!settings || typeof settings !== 'object') return false;
  const s = settings as Record<string, unknown>;
  return (
    typeof s.alertThreshold === 'number' &&
    typeof s.enableAlerts === 'boolean' &&
    (s.budgetBulanan === undefined || typeof s.budgetBulanan === 'number')
  );
}
