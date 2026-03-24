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
  tanggalLahir: string; // ISO date string (YYYY-MM-DD)
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
  targetBeratBadan?: number; // kg - target weight goal
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
  tanggalLahir: '',
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
  targetBeratBadan: undefined,
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

// BMI calculation and interpretation
export function calculateBMI(beratBadan: number, tinggiBadan: number): number {
  const tinggiMeter = tinggiBadan / 100;
  return beratBadan / (tinggiMeter * tinggiMeter);
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export function getBMICategory(bmi: number): { category: BMICategory; label: string; color: string } {
  if (bmi < 18.5) return { category: 'underweight', label: 'Berat Badan Kurang', color: 'text-blue-500' };
  if (bmi < 25) return { category: 'normal', label: 'Berat Badan Normal', color: 'text-green-500' };
  if (bmi < 30) return { category: 'overweight', label: 'Berat Badan Berlebih', color: 'text-yellow-500' };
  return { category: 'obese', label: 'Obesitas', color: 'text-red-500' };
}

// Calculate ideal weight range based on height and optimal BMI (18.5-25)
export function calculateIdealWeightRange(tinggiBadan: number): { min: number; max: number } {
  const tinggiMeter = tinggiBadan / 100;
  const tinggiSquared = tinggiMeter * tinggiMeter;
  return {
    min: Math.round(18.5 * tinggiSquared * 10) / 10,
    max: Math.round(25 * tinggiSquared * 10) / 10,
  };
}

// Health tips based on BMI category and nutrition goal
export function getHealthTips(
  bmiCategory: BMICategory | null,
  tujuanNutrisi: UserProfile['tujuanNutrisi']
): string[] {
  const tips: string[] = [];

  // BMI-based tips
  if (bmiCategory === 'underweight') {
    tips.push('💪 Fokus pada makanan padat nutrisi seperti kacang-kacangan, alpukat, dan protein berkualitas');
    tips.push('🍽️ Makan lebih sering dengan porsi kecil (5-6x sehari) untuk menambah kalori');
    tips.push('🥛 Tambahkan susu, keju, atau yogurt dalam menu harian');
  } else if (bmiCategory === 'normal') {
    tips.push('✅ Pertahankan pola makan seimbang dengan variasi makanan');
    tips.push('🏃 Lanjutkan aktivitas fisik rutin 150 menit per minggu');
    tips.push('💧 Jaga hidrasi dengan minum air putih 8 gelas sehari');
  } else if (bmiCategory === 'overweight') {
    tips.push('🥗 Perbanyak sayuran dan buah dalam setiap makan');
    tips.push('⏰ Hindari makan 3 jam sebelum tidur');
    tips.push('🚶 Tingkatkan aktivitas fisik secara bertahap');
  } else if (bmiCategory === 'obese') {
    tips.push('👩‍⚕️ Konsultasikan dengan dokter atau ahli gizi untuk program yang tepat');
    tips.push('📝 Catat makanan harian untuk awareness kalori');
    tips.push('🎯 Target penurunan 0.5-1 kg per minggu untuk hasil berkelanjutan');
  }

  // Goal-based tips
  if (tujuanNutrisi === 'turun_berat') {
    tips.push('🔥 Defisit kalori 500 kkal/hari untuk turun 0.5 kg/minggu');
    tips.push('🥩 Prioritaskan protein untuk menjaga massa otot saat diet');
    tips.push('🚫 Kurangi makanan olahan dan minuman manis');
  } else if (tujuanNutrisi === 'naik_berat') {
    tips.push('📈 Surplus kalori 300-500 kkal/hari untuk kenaikan sehat');
    tips.push('🏋️ Kombinasikan dengan latihan kekuatan untuk massa otot');
    tips.push('🍌 Konsumsi smoothie tinggi kalori sebagai camilan');
  } else if (tujuanNutrisi === 'jaga_berat') {
    tips.push('⚖️ Pantau berat badan mingguan untuk deteksi dini perubahan');
    tips.push('🍱 Persiapkan meal prep untuk konsistensi nutrisi');
  }

  return tips.slice(0, 4); // Limit to 4 tips
}

// Calculate daily water intake based on weight and activity level
export function calculateDailyWaterIntake(
  beratBadan: number,
  levelAktivitas: UserProfile['levelAktivitas']
): { liters: number; glasses: number } {
  // Base: 30ml per kg body weight
  let mlPerKg = 30;
  
  // Adjust for activity level
  switch (levelAktivitas) {
    case 'sangat_ringan':
      mlPerKg = 30;
      break;
    case 'ringan':
      mlPerKg = 33;
      break;
    case 'sedang':
      mlPerKg = 35;
      break;
    case 'aktif':
      mlPerKg = 38;
      break;
    case 'sangat_aktif':
      mlPerKg = 40;
      break;
    default:
      mlPerKg = 35;
  }
  
  const totalMl = beratBadan * mlPerKg;
  const liters = Math.round(totalMl / 100) / 10; // Round to 1 decimal
  const glasses = Math.round(totalMl / 250); // 250ml per glass
  
  return { liters, glasses };
}
