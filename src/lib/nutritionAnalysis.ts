import { DailyNutrition, NutritionEntry } from '@/hooks/useDailyNutrition';

export interface NutritionTargets {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
}

export interface NutritionPattern {
  // Logging consistency
  daysLogged: number;
  totalDays: number;
  loggingRate: number;
  
  // Target achievement
  daysOnCalorieTarget: number;
  daysOnProteinTarget: number;
  avgCalorieDeviation: number;
  
  // Macro distribution
  avgProteinRatio: number;
  avgCarbRatio: number;
  avgFatRatio: number;
  
  // Meal timing
  breakfastRate: number;
  lunchRate: number;
  dinnerRate: number;
  
  // Trends
  caloriesTrend: 'increasing' | 'decreasing' | 'stable';
  proteinTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Top foods
  topFoods: { name: string; count: number }[];
  
  // Weekly breakdown
  weeklyAverages: {
    week: number;
    avgKalori: number;
    avgProtein: number;
  }[];
}

function getMealTime(waktu: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = parseInt(waktu.split(':')[0], 10);
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
}

function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 7) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (diff > 10) return 'increasing';
  if (diff < -10) return 'decreasing';
  return 'stable';
}

export function analyzeNutritionPattern(
  data: Record<string, DailyNutrition>,
  targets: NutritionTargets
): NutritionPattern {
  const dates = Object.keys(data).sort();
  const totalDays = 30;
  const daysLogged = dates.filter(d => data[d].entries.length > 0).length;
  
  let daysOnCalorieTarget = 0;
  let daysOnProteinTarget = 0;
  let totalCalorieDeviation = 0;
  let totalProteinRatio = 0;
  let totalCarbRatio = 0;
  let totalFatRatio = 0;
  let ratioDays = 0;
  
  const mealTimeCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  const foodCounts: Record<string, number> = {};
  const dailyCalories: number[] = [];
  const dailyProtein: number[] = [];
  
  dates.forEach(date => {
    const day = data[date];
    if (day.entries.length === 0) return;
    
    dailyCalories.push(day.totalKalori);
    dailyProtein.push(day.totalProtein);
    
    // Target achievement
    const calorieDeviation = Math.abs(day.totalKalori - targets.kalori) / targets.kalori;
    if (calorieDeviation <= 0.1) daysOnCalorieTarget++;
    if (day.totalProtein >= targets.protein * 0.9) daysOnProteinTarget++;
    totalCalorieDeviation += calorieDeviation;
    
    // Macro ratios
    const totalMacros = day.totalProtein + day.totalKarbohidrat + day.totalLemak;
    if (totalMacros > 0) {
      totalProteinRatio += (day.totalProtein * 4) / (day.totalKalori || 1);
      totalCarbRatio += (day.totalKarbohidrat * 4) / (day.totalKalori || 1);
      totalFatRatio += (day.totalLemak * 9) / (day.totalKalori || 1);
      ratioDays++;
    }
    
    // Meal timing & food counts
    const dayMeals = new Set<string>();
    day.entries.forEach(entry => {
      const mealTime = getMealTime(entry.waktu);
      dayMeals.add(mealTime);
      
      foodCounts[entry.nama] = (foodCounts[entry.nama] || 0) + 1;
    });
    
    dayMeals.forEach(meal => {
      mealTimeCounts[meal as keyof typeof mealTimeCounts]++;
    });
  });
  
  // Calculate weekly averages
  const weeklyAverages: NutritionPattern['weeklyAverages'] = [];
  for (let week = 0; week < 4; week++) {
    const weekDates = dates.filter(d => {
      const dayIndex = dates.indexOf(d);
      return dayIndex >= week * 7 && dayIndex < (week + 1) * 7;
    });
    
    if (weekDates.length > 0) {
      const weekData = weekDates.map(d => data[d]).filter(d => d.entries.length > 0);
      if (weekData.length > 0) {
        weeklyAverages.push({
          week: week + 1,
          avgKalori: Math.round(weekData.reduce((s, d) => s + d.totalKalori, 0) / weekData.length),
          avgProtein: Math.round(weekData.reduce((s, d) => s + d.totalProtein, 0) / weekData.length),
        });
      }
    }
  }
  
  // Top foods
  const topFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  
  return {
    daysLogged,
    totalDays,
    loggingRate: (daysLogged / totalDays) * 100,
    daysOnCalorieTarget,
    daysOnProteinTarget,
    avgCalorieDeviation: daysLogged > 0 ? (totalCalorieDeviation / daysLogged) * 100 : 0,
    avgProteinRatio: ratioDays > 0 ? (totalProteinRatio / ratioDays) * 100 : 0,
    avgCarbRatio: ratioDays > 0 ? (totalCarbRatio / ratioDays) * 100 : 0,
    avgFatRatio: ratioDays > 0 ? (totalFatRatio / ratioDays) * 100 : 0,
    breakfastRate: daysLogged > 0 ? (mealTimeCounts.breakfast / daysLogged) * 100 : 0,
    lunchRate: daysLogged > 0 ? (mealTimeCounts.lunch / daysLogged) * 100 : 0,
    dinnerRate: daysLogged > 0 ? (mealTimeCounts.dinner / daysLogged) * 100 : 0,
    caloriesTrend: calculateTrend(dailyCalories),
    proteinTrend: calculateTrend(dailyProtein),
    topFoods,
    weeklyAverages,
  };
}

export interface RecommendationInput {
  pattern: NutritionPattern;
  targets: NutritionTargets;
  waterStreak: number;
  waterDaysCompleted: number;
  weightProgress: number | null; // percentage to goal
  weightTrend: 'up' | 'down' | 'stable';
}

export function generateRecommendations(input: RecommendationInput): string[] {
  const recommendations: string[] = [];
  const { pattern, targets, waterStreak, waterDaysCompleted, weightProgress, weightTrend } = input;
  
  // Logging consistency
  if (pattern.loggingRate < 50) {
    recommendations.push('📝 Tingkatkan konsistensi pencatatan makanan. Catat minimal 5 hari per minggu untuk tracking yang akurat.');
  }
  
  // Calorie target
  if (pattern.daysOnCalorieTarget < pattern.daysLogged * 0.5) {
    if (pattern.avgCalorieDeviation > 20) {
      recommendations.push('🎯 Kalori harian sering meleset dari target. Perhatikan porsi makan dan gunakan timbangan makanan.');
    }
  }
  
  // Protein intake
  if (pattern.avgProteinRatio < 15) {
    recommendations.push('🥩 Asupan protein rendah. Tambahkan sumber protein seperti telur, ikan, tempe, atau ayam di setiap makan.');
  }
  
  // Breakfast consistency
  if (pattern.breakfastRate < 50) {
    recommendations.push('🌅 Sarapan hanya tercatat ' + Math.round(pattern.breakfastRate) + '% hari. Biasakan sarapan untuk metabolisme yang lebih baik.');
  }
  
  // Meal distribution
  if (pattern.dinnerRate > pattern.lunchRate * 1.5) {
    recommendations.push('🍽️ Makan malam lebih sering dari makan siang. Perbanyak makan di siang hari untuk energi optimal.');
  }
  
  // Carb intake
  if (pattern.avgCarbRatio > 60) {
    recommendations.push('🍚 Rasio karbohidrat tinggi. Kurangi nasi putih dan ganti dengan karbohidrat kompleks seperti nasi merah atau oatmeal.');
  }
  
  // Fat intake
  if (pattern.avgFatRatio > 40) {
    recommendations.push('🥑 Asupan lemak cukup tinggi. Pilih lemak sehat seperti alpukat, kacang-kacangan, dan ikan berlemak.');
  }
  
  // Water intake
  if (waterStreak < 3) {
    recommendations.push('💧 Tingkatkan konsumsi air. Pasang reminder setiap 2 jam untuk membantu kebiasaan minum.');
  } else if (waterDaysCompleted >= 5) {
    recommendations.push('💧 Bagus! Konsumsi air sudah konsisten. Pertahankan streak Anda!');
  }
  
  // Weight progress
  if (weightProgress !== null) {
    if (weightProgress >= 75) {
      recommendations.push('⚖️ Luar biasa! Progress berat badan sudah ' + Math.round(weightProgress) + '%. Terus pertahankan pola makan sehat.');
    } else if (weightProgress > 0 && weightProgress < 25) {
      recommendations.push('⚖️ Progress berat badan masih ' + Math.round(weightProgress) + '%. Tetap konsisten dan sabar, hasil akan terlihat.');
    }
  }
  
  // Calorie trend
  if (pattern.caloriesTrend === 'increasing' && weightTrend !== 'down') {
    recommendations.push('📈 Trend kalori meningkat. Perhatikan porsi makan terutama di akhir pekan.');
  }
  
  // Positive reinforcement
  if (pattern.daysOnCalorieTarget >= pattern.daysLogged * 0.7) {
    recommendations.push('🌟 Target kalori tercapai di ' + Math.round((pattern.daysOnCalorieTarget / pattern.daysLogged) * 100) + '% hari yang dicatat. Kerja bagus!');
  }
  
  return recommendations.slice(0, 7);
}

export function calculateOverallScore(pattern: NutritionPattern, waterDaysCompleted: number): number {
  let score = 0;
  
  // Logging consistency (max 25 points)
  score += Math.min(25, pattern.loggingRate * 0.25);
  
  // Target achievement (max 25 points)
  const targetRate = pattern.daysLogged > 0 
    ? (pattern.daysOnCalorieTarget / pattern.daysLogged) * 100 
    : 0;
  score += Math.min(25, targetRate * 0.25);
  
  // Meal timing consistency (max 20 points)
  const mealScore = (pattern.breakfastRate + pattern.lunchRate + pattern.dinnerRate) / 3;
  score += Math.min(20, mealScore * 0.2);
  
  // Macro balance (max 15 points)
  const proteinOk = pattern.avgProteinRatio >= 15 && pattern.avgProteinRatio <= 35;
  const carbOk = pattern.avgCarbRatio >= 40 && pattern.avgCarbRatio <= 60;
  const fatOk = pattern.avgFatRatio >= 20 && pattern.avgFatRatio <= 35;
  score += (proteinOk ? 5 : 0) + (carbOk ? 5 : 0) + (fatOk ? 5 : 0);
  
  // Water consistency (max 15 points)
  score += Math.min(15, (waterDaysCompleted / 7) * 15);
  
  return Math.round(score);
}
