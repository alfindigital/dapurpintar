import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import { DailyNutrition } from "@/hooks/useDailyNutrition";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalorieHeatmapProps {
  nutritionData: Record<string, DailyNutrition>;
  targetKalori: number;
}

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Returns intensity 0-4 based on calorie percentage of target
function getIntensity(kalori: number, target: number): number {
  if (kalori === 0) return 0;
  const pct = kalori / target;
  if (pct < 0.25) return 1;
  if (pct < 0.6) return 2;
  if (pct <= 1.2) return 3;
  return 4; // over target
}

const INTENSITY_CLASSES = [
  "bg-muted/40",                          // 0: no data
  "bg-primary/15",                        // 1: low
  "bg-primary/35",                        // 2: moderate
  "bg-primary/60",                        // 3: on target
  "bg-primary",                           // 4: over target
];

const INTENSITY_LABELS = [
  "Tidak ada data",
  "< 25% target",
  "25-60% target", 
  "60-120% target",
  "> 120% target",
];

export function CalorieHeatmap({ nutritionData, targetKalori }: CalorieHeatmapProps) {
  // Generate last 28 days (4 weeks) grid data
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    const days: { date: string; kalori: number; intensity: number; dayOfWeek: number; label: string }[] = [];

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const kalori = nutritionData[key]?.totalKalori || 0;
      const intensity = getIntensity(kalori, targetKalori);

      days.push({
        date: key,
        kalori,
        intensity,
        dayOfWeek: (d.getDay() + 6) % 7, // Monday = 0
        label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      });
    }

    // Group into weeks (rows of 7)
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Stats
    const daysWithData = days.filter(d => d.kalori > 0);
    const onTargetDays = days.filter(d => d.intensity === 3).length;
    const avgKalori = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.kalori, 0) / daysWithData.length)
      : 0;
    const streak = (() => {
      let count = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].kalori > 0) count++;
        else break;
      }
      return count;
    })();

    return {
      weeks,
      stats: { daysWithData: daysWithData.length, onTargetDays, avgKalori, streak },
    };
  }, [nutritionData, targetKalori]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Heatmap Kalori</CardTitle>
          <HelpTooltip content="Peta warna asupan kalori 28 hari terakhir. Semakin gelap, semakin dekat dengan target." />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{stats.daysWithData}</div>
            <div className="text-[10px] text-muted-foreground">Hari tercatat</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{stats.onTargetDays}</div>
            <div className="text-[10px] text-muted-foreground">Sesuai target</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{stats.streak}</div>
            <div className="text-[10px] text-muted-foreground">Streak hari</div>
          </div>
        </div>

        {/* Heatmap grid */}
        <TooltipProvider delayDuration={100}>
          <div className="space-y-1">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(label => (
                <div key={label} className="text-[10px] text-muted-foreground text-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <button
                        className={`aspect-square rounded-sm transition-colors ${INTENSITY_CLASSES[day.intensity]} hover:ring-2 hover:ring-primary/40`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="font-medium">{day.label}</div>
                      <div>
                        {day.kalori > 0
                          ? `${day.kalori.toLocaleString("id-ID")} kkal`
                          : "Tidak ada data"}
                      </div>
                      {day.kalori > 0 && (
                        <div className="text-muted-foreground">
                          {Math.round((day.kalori / targetKalori) * 100)}% dari target
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Rendah</span>
          {INTENSITY_CLASSES.slice(1).map((cls, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${cls}`}
              title={INTENSITY_LABELS[i + 1]}
            />
          ))}
          <span>Tinggi</span>
        </div>
      </CardContent>
    </Card>
  );
}
