import { useState, useEffect } from "react";
import { Droplets, Plus, Minus, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWaterTracking } from "@/hooks/useWaterTracking";
import { calculateDailyWaterIntake } from "@/types/profile";
import { toast } from "sonner";
import { WeeklyWaterChart } from "./WeeklyWaterChart";
import { WaterAchievements } from "./WaterAchievements";
import { WaterReminderSettings } from "./WaterReminderSettings";

const CUSTOM_TARGET_KEY = 'water_custom_target';

interface WaterTrackerProps {
  beratBadan?: number;
  levelAktivitas?: 'sangat_ringan' | 'ringan' | 'sedang' | 'aktif' | 'sangat_aktif';
}

export function WaterTracker({ beratBadan, levelAktivitas }: WaterTrackerProps) {
  // Custom target state
  const [useCustomTarget, setUseCustomTarget] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_TARGET_KEY);
    return saved ? JSON.parse(saved).enabled : false;
  });
  const [customTarget, setCustomTarget] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_TARGET_KEY);
    return saved ? JSON.parse(saved).value : 8;
  });

  // Calculate auto target based on weight and activity
  const autoTarget = beratBadan 
    ? calculateDailyWaterIntake(beratBadan, levelAktivitas).glasses
    : 8;

  // Use custom or auto target
  const target = useCustomTarget ? customTarget : autoTarget;

  // Save custom target settings
  useEffect(() => {
    localStorage.setItem(CUSTOM_TARGET_KEY, JSON.stringify({
      enabled: useCustomTarget,
      value: customTarget,
    }));
  }, [useCustomTarget, customTarget]);

  const { 
    glasses, 
    addGlass, 
    removeGlass, 
    resetToday, 
    weeklyData, 
    stats,
    unlockedAchievements,
    totalGlassesAllTime,
  } = useWaterTracking(target);

  const percentage = Math.min(100, (glasses / target) * 100);
  const isComplete = glasses >= target;

  const handleAddGlass = () => {
    addGlass();
    if (glasses + 1 === target) {
      toast.success("🎉 Target minum air tercapai!");
    } else if (glasses + 1 > target) {
      toast("💧 Bonus! Tetap terhidrasi", { duration: 2000 });
    }
  };

  const handleReset = () => {
    resetToday();
    toast.success("Tracker direset");
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-soft-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Droplets className="h-5 w-5 text-secondary" />
              Tracker Air Harian
            </CardTitle>
            
            {/* Target Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Target Harian</h4>
                    <p className="text-xs text-muted-foreground">Atur target air harian</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-target" className="text-sm">
                      Target Manual
                    </Label>
                    <Switch
                      id="custom-target"
                      checked={useCustomTarget}
                      onCheckedChange={setUseCustomTarget}
                    />
                  </div>
                  
                  {useCustomTarget ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Jumlah gelas per hari
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={customTarget}
                          onChange={(e) => setCustomTarget(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          gelas ({customTarget * 250}ml)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Auto (berat & aktivitas):
                      </p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        {autoTarget} gelas ({autoTarget * 250}ml)
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Display */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-secondary">
              {glasses}
              <span className="text-lg font-normal text-muted-foreground">/{target}</span>
            </div>
            <p className="text-sm text-muted-foreground">gelas (250ml)</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={percentage} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(percentage)}%</span>
              <span>{isComplete ? "✅ Tercapai!" : `${target - glasses} gelas lagi`}</span>
            </div>
          </div>

          {/* Glass Visualization */}
          <div className="flex flex-wrap justify-center gap-1.5 py-2">
            {Array.from({ length: target }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-8 rounded-b-lg border-2 transition-all duration-300 ${
                  i < glasses
                    ? "bg-secondary border-secondary"
                    : "bg-muted/30 border-muted-foreground/20"
                }`}
              />
            ))}
            {glasses > target && (
              <div className="flex items-center text-xs text-secondary font-medium ml-1">
                +{glasses - target}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={removeGlass}
              disabled={glasses === 0}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Button
              size="lg"
              onClick={handleAddGlass}
              className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Gelas
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-10 w-10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Last drink time */}
          {glasses > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Terakhir minum: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}

          {/* Achievements Preview */}
          <WaterAchievements 
            unlockedIds={unlockedAchievements}
            streak={stats.streak}
            totalGlasses={totalGlassesAllTime}
          />
        </CardContent>
      </Card>

      {/* Weekly Water Stats */}
      <WeeklyWaterChart weeklyData={weeklyData} stats={stats} target={target} />

      {/* Water Reminder Settings */}
      <WaterReminderSettings />
    </div>
  );
}
