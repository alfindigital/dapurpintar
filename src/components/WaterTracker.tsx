import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWaterTracking } from "@/hooks/useWaterTracking";
import { calculateDailyWaterIntake } from "@/types/profile";
import { toast } from "sonner";

interface WaterTrackerProps {
  beratBadan?: number;
  levelAktivitas?: 'sangat_ringan' | 'ringan' | 'sedang' | 'aktif' | 'sangat_aktif';
}

export function WaterTracker({ beratBadan, levelAktivitas }: WaterTrackerProps) {
  const { glasses, addGlass, removeGlass, resetToday } = useWaterTracking();

  // Calculate target based on weight and activity, or default to 8 glasses
  const target = beratBadan 
    ? calculateDailyWaterIntake(beratBadan, levelAktivitas).glasses
    : 8;

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Tracker Air Harian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {glasses}
            <span className="text-lg font-normal text-muted-foreground">/{target}</span>
          </div>
          <p className="text-sm text-muted-foreground">gelas (250ml)</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={percentage} className="h-3" />
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
                  ? "bg-blue-500 border-blue-600"
                  : "bg-muted/30 border-muted-foreground/20"
              }`}
            />
          ))}
          {glasses > target && (
            <div className="flex items-center text-xs text-blue-500 font-medium ml-1">
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
            className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white"
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
      </CardContent>
    </Card>
  );
}
