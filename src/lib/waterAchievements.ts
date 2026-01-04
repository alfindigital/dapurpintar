import { Droplets, Flame, Trophy, Medal, Star, Crown, Zap, Target, Award, Heart } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Droplets;
  requirement: number;
  type: "streak" | "total" | "daily" | "weekly";
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  { id: "streak_3", name: "Pemula Konsisten", description: "Capai target 3 hari berturut-turut", icon: Flame, requirement: 3, type: "streak", tier: "bronze" },
  { id: "streak_7", name: "Seminggu Terhidrasi", description: "Capai target 7 hari berturut-turut", icon: Flame, requirement: 7, type: "streak", tier: "silver" },
  { id: "streak_14", name: "Dua Minggu Kuat", description: "Capai target 14 hari berturut-turut", icon: Flame, requirement: 14, type: "streak", tier: "gold" },
  { id: "streak_30", name: "Master Hidrasi", description: "Capai target 30 hari berturut-turut", icon: Crown, requirement: 30, type: "streak", tier: "platinum" },
  
  // Total Glasses Achievements
  { id: "total_50", name: "Langkah Pertama", description: "Minum total 50 gelas", icon: Droplets, requirement: 50, type: "total", tier: "bronze" },
  { id: "total_100", name: "Seratus Gelas", description: "Minum total 100 gelas", icon: Medal, requirement: 100, type: "total", tier: "silver" },
  { id: "total_250", name: "Seperempat Ribu", description: "Minum total 250 gelas", icon: Trophy, requirement: 250, type: "total", tier: "gold" },
  { id: "total_500", name: "Setengah Ribu", description: "Minum total 500 gelas", icon: Star, requirement: 500, type: "total", tier: "gold" },
  { id: "total_1000", name: "Seribu Gelas", description: "Minum total 1000 gelas", icon: Crown, requirement: 1000, type: "total", tier: "platinum" },
  
  // Daily Achievements
  { id: "daily_target", name: "Target Harian", description: "Capai target harian pertama", icon: Target, requirement: 1, type: "daily", tier: "bronze" },
  { id: "daily_double", name: "Double Hidrasi", description: "Minum 2x target harian", icon: Zap, requirement: 2, type: "daily", tier: "silver" },
  
  // Weekly Achievements
  { id: "weekly_perfect", name: "Minggu Sempurna", description: "Capai target setiap hari dalam seminggu", icon: Award, requirement: 7, type: "weekly", tier: "gold" },
  { id: "weekly_5days", name: "Lima Hari Kuat", description: "Capai target 5 hari dalam seminggu", icon: Heart, requirement: 5, type: "weekly", tier: "silver" },
];

export const TIER_COLORS = {
  bronze: { bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700" },
  silver: { bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-600 dark:text-slate-300", border: "border-slate-300 dark:border-slate-600" },
  gold: { bg: "bg-yellow-100 dark:bg-yellow-950/40", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-600" },
  platinum: { bg: "bg-purple-100 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", border: "border-purple-300 dark:border-purple-600" },
};

export function checkAchievements(
  streak: number,
  totalGlasses: number,
  todayGlasses: number,
  target: number,
  daysCompletedThisWeek: number,
  unlockedIds: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;

    let unlocked = false;

    switch (achievement.type) {
      case "streak":
        unlocked = streak >= achievement.requirement;
        break;
      case "total":
        unlocked = totalGlasses >= achievement.requirement;
        break;
      case "daily":
        if (achievement.id === "daily_target") {
          unlocked = todayGlasses >= target;
        } else if (achievement.id === "daily_double") {
          unlocked = todayGlasses >= target * 2;
        }
        break;
      case "weekly":
        unlocked = daysCompletedThisWeek >= achievement.requirement;
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
