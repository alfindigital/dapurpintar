import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, ChevronRight, Scale, Target, TrendingDown, TrendingUp } from "lucide-react";
import { 
  WeightAchievement, 
  WEIGHT_ACHIEVEMENTS, 
  TIER_COLORS, 
  checkWeightAchievements,
  calculateMilestones
} from "@/lib/weightAchievements";
import { toast } from "sonner";

interface WeightAchievementsProps {
  initialWeight: number | null;
  currentWeight: number | null;
  targetWeight?: number;
  totalEntries: number;
}

const STORAGE_KEY = "weight_achievements_unlocked";

export function WeightAchievements({ 
  initialWeight, 
  currentWeight, 
  targetWeight, 
  totalEntries 
}: WeightAchievementsProps) {
  const [open, setOpen] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  
  // Load unlocked achievements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUnlockedIds(JSON.parse(saved));
      } catch {
        setUnlockedIds([]);
      }
    }
  }, []);
  
  // Check for new achievements
  useEffect(() => {
    const newAchievements = checkWeightAchievements(
      initialWeight,
      currentWeight,
      targetWeight,
      totalEntries,
      unlockedIds
    );
    
    if (newAchievements.length > 0) {
      const newIds = [...unlockedIds, ...newAchievements.map(a => a.id)];
      setUnlockedIds(newIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      
      // Show toast for each new achievement
      newAchievements.forEach(achievement => {
        toast.success(
          <div className="flex items-center gap-2">
            <achievement.icon className="h-5 w-5 text-amber-500" />
            <div>
              <div className="font-semibold">🎉 Achievement Baru!</div>
              <div className="text-sm">{achievement.name}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
      });
    }
  }, [initialWeight, currentWeight, targetWeight, totalEntries, unlockedIds]);
  
  const unlockedCount = unlockedIds.length;
  const totalCount = WEIGHT_ACHIEVEMENTS.length;
  
  // Get goal direction
  const goalDirection = !initialWeight || !targetWeight 
    ? "maintain" 
    : targetWeight < initialWeight 
      ? "lose" 
      : "gain";
  
  // Calculate milestones
  const milestones = calculateMilestones(initialWeight, currentWeight, targetWeight, goalDirection);
  
  // Weight change stats
  const weightChange = initialWeight && currentWeight ? currentWeight - initialWeight : 0;
  const isLosingWeight = weightChange < 0;
  
  // Get recently unlocked (last 3)
  const recentUnlocked = WEIGHT_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).slice(-3);

  return (
    <>
      {/* Compact Preview */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-medium">Goal & Achievement</div>
            <div className="text-xs text-muted-foreground">
              {unlockedCount}/{totalCount} terbuka
            </div>
          </div>
        </div>
        
        {/* Recent badges preview */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {recentUnlocked.map(achievement => {
              const Icon = achievement.icon;
              const colors = TIER_COLORS[achievement.tier];
              return (
                <div
                  key={achievement.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} border-2 ${colors.border}`}
                  title={achievement.name}
                >
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
              );
            })}
            {unlockedCount === 0 && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/20">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Goal Berat Badan
                </DialogTitle>
              </DialogHeader>
              
              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-lg font-bold">{initialWeight || '-'}</div>
                  <div className="text-[10px] text-muted-foreground">Awal (kg)</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-lg font-bold">{currentWeight || '-'}</div>
                  <div className="text-[10px] text-muted-foreground">Sekarang (kg)</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className={`text-lg font-bold flex items-center justify-center gap-0.5 ${
                    isLosingWeight ? "text-green-500" : weightChange > 0 ? "text-orange-500" : ""
                  }`}>
                    {isLosingWeight ? <TrendingDown className="h-4 w-4" /> : weightChange > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                    {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}` : '-'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Perubahan</div>
                </div>
              </div>
              
              {/* Milestones Progress */}
              {targetWeight && initialWeight && (
                <div className="mb-4 p-3 rounded-lg bg-primary/5 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Milestone Menuju {targetWeight} kg</span>
                  </div>
                  <div className="space-y-3">
                    {milestones.map((milestone) => {
                      const Icon = milestone.icon;
                      const colors = TIER_COLORS[milestone.tier];
                      const progressPercent = milestone.kgRequired > 0 
                        ? Math.min(100, (milestone.current / milestone.kgRequired) * 100) 
                        : 0;
                      
                      return (
                        <div key={milestone.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className={`p-1 rounded ${milestone.unlocked ? colors.bg : 'bg-muted'}`}>
                                <Icon className={`h-3 w-3 ${milestone.unlocked ? colors.text : 'text-muted-foreground'}`} />
                              </div>
                              <span className={milestone.unlocked ? 'font-medium' : 'text-muted-foreground'}>
                                {milestone.name}
                              </span>
                            </div>
                            <span className={milestone.unlocked ? colors.text : 'text-muted-foreground'}>
                              {milestone.current}/{milestone.kgRequired} kg
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Achievements List */}
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Achievement ({unlockedCount}/{totalCount})</span>
              </div>
              
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {WEIGHT_ACHIEVEMENTS.map(achievement => {
                    const isUnlocked = unlockedIds.includes(achievement.id);
                    const Icon = achievement.icon;
                    const colors = TIER_COLORS[achievement.tier];
                    
                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isUnlocked 
                            ? `${colors.bg} ${colors.border}` 
                            : "bg-muted/30 border-muted-foreground/10 opacity-60"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${isUnlocked ? colors.bg : "bg-muted"}`}>
                          {isUnlocked ? (
                            <Icon className={`h-5 w-5 ${colors.text}`} />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isUnlocked ? "" : "text-muted-foreground"}`}>
                              {achievement.name}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isUnlocked ? colors.text : ""}`}>
                              {achievement.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {achievement.description}
                          </p>
                        </div>
                        {isUnlocked && (
                          <span className="text-green-500 text-lg">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
