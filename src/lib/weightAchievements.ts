import { Scale, Target, TrendingDown, TrendingUp, Trophy, Medal, Star, Crown, Flame, Award, Heart, Zap } from "lucide-react";

export interface WeightAchievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Scale;
  requirement: number;
  type: "milestone" | "streak" | "consistency" | "goal";
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface WeightMilestone {
  id: string;
  name: string;
  kgRequired: number;
  icon: typeof Star;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlocked: boolean;
  current: number;
}

export const WEIGHT_ACHIEVEMENTS: WeightAchievement[] = [
  // Milestone Achievements - Weight Loss
  { id: "lost_1kg", name: "Langkah Pertama", description: "Turunkan 1 kg dari berat awal", icon: TrendingDown, requirement: 1, type: "milestone", tier: "bronze" },
  { id: "lost_3kg", name: "Momentum Bagus", description: "Turunkan 3 kg dari berat awal", icon: TrendingDown, requirement: 3, type: "milestone", tier: "silver" },
  { id: "lost_5kg", name: "Setengah Jalan", description: "Turunkan 5 kg dari berat awal", icon: Medal, requirement: 5, type: "milestone", tier: "gold" },
  { id: "lost_10kg", name: "Transformasi Luar Biasa", description: "Turunkan 10 kg dari berat awal", icon: Crown, requirement: 10, type: "milestone", tier: "platinum" },
  
  // Milestone Achievements - Weight Gain
  { id: "gained_1kg", name: "Mulai Naik", description: "Naikkan 1 kg dari berat awal", icon: TrendingUp, requirement: 1, type: "milestone", tier: "bronze" },
  { id: "gained_3kg", name: "Progress Solid", description: "Naikkan 3 kg dari berat awal", icon: TrendingUp, requirement: 3, type: "milestone", tier: "silver" },
  { id: "gained_5kg", name: "Bulking Master", description: "Naikkan 5 kg dari berat awal", icon: Trophy, requirement: 5, type: "milestone", tier: "gold" },
  
  // Consistency Achievements
  { id: "logged_7days", name: "Seminggu Konsisten", description: "Catat berat badan selama 7 hari", icon: Flame, requirement: 7, type: "consistency", tier: "bronze" },
  { id: "logged_14days", name: "Dua Minggu Disiplin", description: "Catat berat badan selama 14 hari", icon: Flame, requirement: 14, type: "consistency", tier: "silver" },
  { id: "logged_30days", name: "Sebulan Penuh", description: "Catat berat badan selama 30 hari", icon: Star, requirement: 30, type: "consistency", tier: "gold" },
  { id: "logged_60days", name: "Komitmen Tinggi", description: "Catat berat badan selama 60 hari", icon: Crown, requirement: 60, type: "consistency", tier: "platinum" },
  
  // Goal Achievements
  { id: "reach_goal", name: "Target Tercapai!", description: "Capai target berat badan ideal", icon: Target, requirement: 1, type: "goal", tier: "platinum" },
  { id: "halfway_goal", name: "Setengah Perjalanan", description: "Capai 50% progress menuju target", icon: Award, requirement: 50, type: "goal", tier: "gold" },
  { id: "quarter_goal", name: "Seperempat Jalan", description: "Capai 25% progress menuju target", icon: Heart, requirement: 25, type: "goal", tier: "silver" },
];

export const TIER_COLORS = {
  bronze: { bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700" },
  silver: { bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-600 dark:text-slate-300", border: "border-slate-300 dark:border-slate-600" },
  gold: { bg: "bg-yellow-100 dark:bg-yellow-950/40", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-600" },
  platinum: { bg: "bg-purple-100 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", border: "border-purple-300 dark:border-purple-600" },
};

export function checkWeightAchievements(
  initialWeight: number | null,
  currentWeight: number | null,
  targetWeight: number | undefined,
  totalEntries: number,
  unlockedIds: string[]
): WeightAchievement[] {
  const newlyUnlocked: WeightAchievement[] = [];

  if (!initialWeight || !currentWeight) return newlyUnlocked;

  const weightChange = currentWeight - initialWeight;
  const weightLost = weightChange < 0 ? Math.abs(weightChange) : 0;
  const weightGained = weightChange > 0 ? weightChange : 0;

  for (const achievement of WEIGHT_ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;

    let unlocked = false;

    switch (achievement.type) {
      case "milestone":
        if (achievement.id.startsWith("lost_")) {
          unlocked = weightLost >= achievement.requirement;
        } else if (achievement.id.startsWith("gained_")) {
          unlocked = weightGained >= achievement.requirement;
        }
        break;
      case "consistency":
        unlocked = totalEntries >= achievement.requirement;
        break;
      case "goal":
        if (targetWeight && initialWeight) {
          const totalToTarget = Math.abs(initialWeight - targetWeight);
          const currentProgress = Math.abs(initialWeight - currentWeight);
          const percentage = totalToTarget > 0 ? (currentProgress / totalToTarget) * 100 : 0;
          
          if (achievement.id === "reach_goal") {
            // Check if within 0.5kg of target
            unlocked = Math.abs(currentWeight - targetWeight) <= 0.5;
          } else if (achievement.id === "halfway_goal") {
            unlocked = percentage >= 50 && Math.abs(currentWeight - targetWeight) > 0.5;
          } else if (achievement.id === "quarter_goal") {
            unlocked = percentage >= 25 && percentage < 50;
          }
        }
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

export function calculateMilestones(
  initialWeight: number | null,
  currentWeight: number | null,
  targetWeight: number | undefined,
  goalDirection: "lose" | "gain" | "maintain"
): WeightMilestone[] {
  const milestones: WeightMilestone[] = [];
  
  if (!initialWeight || !targetWeight) return milestones;
  
  const totalChange = Math.abs(targetWeight - initialWeight);
  const currentChange = currentWeight ? Math.abs(currentWeight - initialWeight) : 0;
  
  // Create 4 milestones at 25%, 50%, 75%, 100%
  const milestoneData = [
    { percent: 25, name: "25%", tier: "bronze" as const, icon: Heart },
    { percent: 50, name: "50%", tier: "silver" as const, icon: Zap },
    { percent: 75, name: "75%", tier: "gold" as const, icon: Star },
    { percent: 100, name: "Target!", tier: "platinum" as const, icon: Crown },
  ];
  
  milestoneData.forEach((m, index) => {
    const kgRequired = (totalChange * m.percent) / 100;
    milestones.push({
      id: `milestone_${m.percent}`,
      name: m.name,
      kgRequired: parseFloat(kgRequired.toFixed(1)),
      icon: m.icon,
      tier: m.tier,
      unlocked: currentChange >= kgRequired,
      current: parseFloat(currentChange.toFixed(1)),
    });
  });
  
  return milestones;
}
