import { Card, CardContent } from "@/components/ui/card";
import { Flame, Droplets, TrendingUp, Target, Zap, Trophy } from "lucide-react";
import { DailyNutrition } from "@/hooks/useDailyNutrition";

interface NutritionOverviewProps {
  weeklyNutrition: Record<string, DailyNutrition>;
  targetKalori: number;
  waterStats: {
    streak: number;
    totalGlasses: number;
    avgGlasses: number;
    daysCompleted: number;
  };
  waterTarget: number;
}

export function NutritionOverview({ 
  weeklyNutrition, 
  targetKalori,
  waterStats,
  waterTarget
}: NutritionOverviewProps) {
  // Calculate weekly nutrition stats
  const nutritionDays = Object.values(weeklyNutrition);
  const avgKalori = nutritionDays.length > 0 
    ? Math.round(nutritionDays.reduce((sum, d) => sum + d.totalKalori, 0) / nutritionDays.length)
    : 0;
  
  const avgProtein = nutritionDays.length > 0 
    ? Math.round(nutritionDays.reduce((sum, d) => sum + d.totalProtein, 0) / nutritionDays.length)
    : 0;

  const daysOnTarget = nutritionDays.filter(d => d.totalKalori >= targetKalori * 0.8 && d.totalKalori <= targetKalori * 1.2).length;

  const stats = [
    {
      icon: Flame,
      label: "Rata-rata Kalori",
      value: `${avgKalori.toLocaleString('id-ID')}`,
      unit: "kcal/hari",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Zap,
      label: "Rata-rata Protein",
      value: `${avgProtein}`,
      unit: "g/hari",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Target,
      label: "Hari Sesuai Target",
      value: `${daysOnTarget}`,
      unit: `dari ${nutritionDays.length} hari`,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Droplets,
      label: "Streak Air",
      value: `${waterStats.streak}`,
      unit: "hari berturut",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: TrendingUp,
      label: "Rata-rata Air",
      value: `${waterStats.avgGlasses.toFixed(1)}`,
      unit: `dari ${waterTarget} gelas`,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10"
    },
    {
      icon: Trophy,
      label: "Target Tercapai",
      value: `${waterStats.daysCompleted}`,
      unit: "hari",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <Card className="border-0 shadow-soft-md">
      <CardContent className="pt-5 pb-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Ringkasan Mingguan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="rounded-xl p-3 flex flex-col gap-1.5 bg-muted/40 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-semibold ${stat.color}`}>{stat.value}</span>
                <span className="text-[11px] text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
