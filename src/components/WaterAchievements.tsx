import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, Lock, ChevronRight } from "lucide-react";
import { Achievement, ACHIEVEMENTS, TIER_COLORS } from "@/lib/waterAchievements";

interface WaterAchievementsProps {
  unlockedIds: string[];
  streak: number;
  totalGlasses: number;
}

export function WaterAchievements({ unlockedIds, streak, totalGlasses }: WaterAchievementsProps) {
  const [open, setOpen] = useState(false);
  
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  
  // Get recently unlocked (last 3)
  const recentUnlocked = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).slice(-3);

  return (
    <>
      {/* Compact Preview */}
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/10">
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="text-sm font-medium">Achievement</div>
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
                  <Award className="h-5 w-5 text-amber-500" />
                  Achievement Hidrasi
                </DialogTitle>
              </DialogHeader>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-lg font-bold">{unlockedCount}</div>
                  <div className="text-[10px] text-muted-foreground">Terbuka</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-lg font-bold">{streak}</div>
                  <div className="text-[10px] text-muted-foreground">Streak</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-lg font-bold">{totalGlasses}</div>
                  <div className="text-[10px] text-muted-foreground">Total Gelas</div>
                </div>
              </div>
              
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-2">
                  {ACHIEVEMENTS.map(achievement => {
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
