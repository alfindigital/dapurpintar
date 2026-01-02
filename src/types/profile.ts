export interface FamilyMember {
  id: string;
  nama: string;
  hubungan: string;
  usia: number;
  kategoriUsia: 'bayi' | 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia';
  kondisiKhusus: string[];
}

export interface UserProfile {
  nama: string;
  usia: number;
  status: 'single' | 'menikah' | 'berkeluarga';
  anggotaKeluarga: FamilyMember[];
  provinsi: string;
  kota: string;
  kemampuanMasak: 'pemula' | 'menengah' | 'mahir';
  waktuMasakTersedia: 'singkat' | 'sedang' | 'panjang';
  budgetMasak: 'hemat' | 'sedang' | 'bebas';
  catatanTambahan: string;
  // Goal setting data
  jenisKelamin?: 'pria' | 'wanita';
  beratBadan?: number; // kg
  tinggiBadan?: number; // cm
  levelAktivitas?: 'sangat_ringan' | 'ringan' | 'sedang' | 'aktif' | 'sangat_aktif';
  tujuanNutrisi?: 'turun_berat' | 'jaga_berat' | 'naik_berat';
  // Target nutrisi harian
  targetKalori?: number;
  targetProtein?: number;
  targetKarbohidrat?: number;
  targetLemak?: number;
  // Flag untuk mode target
  autoCalculateTarget?: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  nama: '',
  usia: 0,
  status: 'single',
  anggotaKeluarga: [],
  provinsi: '',
  kota: '',
  kemampuanMasak: 'pemula',
  waktuMasakTersedia: 'sedang',
  budgetMasak: 'sedang',
  catatanTambahan: '',
  jenisKelamin: undefined,
  beratBadan: undefined,
  tinggiBadan: undefined,
  levelAktivitas: 'sedang',
  tujuanNutrisi: 'jaga_berat',
  targetKalori: 2000,
  targetProtein: 50,
  targetKarbohidrat: 250,
  targetLemak: 65,
  autoCalculateTarget: false,
};

// Mifflin-St Jeor formula for BMR calculation
export function calculateBMR(
  jenisKelamin: 'pria' | 'wanita',
  beratBadan: number,
  tinggiBadan: number,
  usia: number
): number {
  if (jenisKelamin === 'pria') {
    return 10 * beratBadan + 6.25 * tinggiBadan - 5 * usia + 5;
  }
  return 10 * beratBadan + 6.25 * tinggiBadan - 5 * usia - 161;
}

// Activity multipliers
export const ACTIVITY_MULTIPLIERS: Record<NonNullable<UserProfile['levelAktivitas']>, number> = {
  sangat_ringan: 1.2, // Sedentary (little/no exercise)
  ringan: 1.375, // Light exercise (1-3 days/week)
  sedang: 1.55, // Moderate exercise (3-5 days/week)
  aktif: 1.725, // Active (6-7 days/week)
  sangat_aktif: 1.9, // Very active (intense exercise daily)
};

// Goal adjustments
export const GOAL_ADJUSTMENTS: Record<NonNullable<UserProfile['tujuanNutrisi']>, number> = {
  turun_berat: -500, // Deficit for weight loss
  jaga_berat: 0,
  naik_berat: 500, // Surplus for weight gain
};

export function calculateNutritionTargets(profile: UserProfile): {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
} {
  const { jenisKelamin, beratBadan, tinggiBadan, usia, levelAktivitas, tujuanNutrisi } = profile;

  // Return defaults if not enough data
  if (!jenisKelamin || !beratBadan || !tinggiBadan || !usia || usia <= 0) {
    return { kalori: 2000, protein: 50, karbohidrat: 250, lemak: 65 };
  }

  // Calculate BMR
  const bmr = calculateBMR(jenisKelamin, beratBadan, tinggiBadan, usia);

  // Apply activity multiplier
  const activityMultiplier = ACTIVITY_MULTIPLIERS[levelAktivitas || 'sedang'];
  const tdee = bmr * activityMultiplier;

  // Apply goal adjustment
  const goalAdjustment = GOAL_ADJUSTMENTS[tujuanNutrisi || 'jaga_berat'];
  const kalori = Math.round(tdee + goalAdjustment);

  // Calculate macros based on balanced distribution
  // Protein: 1.6-2.2g per kg for active individuals, using 1.8g/kg as balanced
  const protein = Math.round(beratBadan * 1.8);

  // Fat: 25-30% of calories, using 27.5%
  const lemakKalori = kalori * 0.275;
  const lemak = Math.round(lemakKalori / 9); // 9 cal per gram of fat

  // Carbs: remaining calories
  const proteinKalori = protein * 4; // 4 cal per gram of protein
  const karbohidratKalori = kalori - proteinKalori - lemakKalori;
  const karbohidrat = Math.round(karbohidratKalori / 4); // 4 cal per gram of carbs

  return {
    kalori: Math.max(1200, kalori),
    protein: Math.max(40, protein),
    karbohidrat: Math.max(100, karbohidrat),
    lemak: Math.max(30, lemak),
  };
}

export function getKategoriUsia(usia: number): FamilyMember['kategoriUsia'] {
  if (usia < 1) return 'bayi';
  if (usia < 5) return 'balita';
  if (usia < 12) return 'anak';
  if (usia < 18) return 'remaja';
  if (usia < 60) return 'dewasa';
  return 'lansia';
}
