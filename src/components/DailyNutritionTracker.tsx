import { Flame, Beef, Wheat, Droplets, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpTooltip } from "./HelpTooltip";
import { NutritionEntry } from "@/hooks/useDailyNutrition";

interface DailyNutritionTrackerProps {
  entries: NutritionEntry[];
  totalKalori: number;
  totalProtein: number;
  totalKarbohidrat: number;
  totalLemak: number;
  targetKalori: number;
  targetProtein: number;
  targetKarbohidrat: number;
  targetLemak: number;
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
}

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
}

function MacroProgress({ label, current, target, unit, icon, colorClass }: MacroProgressProps) {
  const percent = Math.min((current / target) * 100, 100);
  const isOver = current > target;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span className={colorClass}>{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <span className={isOver ? "text-destructive font-medium" : "text-muted-foreground"}>
          {current}/{target} {unit}
        </span>
      </div>
      <Progress 
        value={percent} 
        className={`h-2 ${isOver ? "[&>div]:bg-destructive" : ""}`}
      />
    </div>
  );
}

export function DailyNutritionTracker({
  entries,
  totalKalori,
  totalProtein,
  totalKarbohidrat,
  totalLemak,
  targetKalori,
  targetProtein,
  targetKarbohidrat,
  targetLemak,
  onRemoveEntry,
  onClearAll,
}: DailyNutritionTrackerProps) {
  const remainingKalori = targetKalori - totalKalori;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Nutrisi Hari Ini</CardTitle>
            <HelpTooltip content="Tracking nutrisi harian berdasarkan resep yang dikonsumsi" />
          </div>
          {entries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs text-muted-foreground">
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-3xl font-bold">{totalKalori}</div>
          <div className="text-sm text-muted-foreground">
            dari {targetKalori} kkal
          </div>
          <Badge 
            variant={remainingKalori >= 0 ? "secondary" : "destructive"} 
            className="mt-1"
          >
            {remainingKalori >= 0 ? `Sisa ${remainingKalori} kkal` : `Lebih ${Math.abs(remainingKalori)} kkal`}
          </Badge>
        </div>

        {/* Macro Progress */}
        <div className="space-y-3">
          <MacroProgress
            label="Kalori"
            current={totalKalori}
            target={targetKalori}
            unit="kkal"
            icon={<Flame className="h-4 w-4" />}
            colorClass="text-orange-500"
          />
          <MacroProgress
            label="Protein"
            current={totalProtein}
            target={targetProtein}
            unit="g"
            icon={<Beef className="h-4 w-4" />}
            colorClass="text-red-500"
          />
          <MacroProgress
            label="Karbohidrat"
            current={totalKarbohidrat}
            target={targetKarbohidrat}
            unit="g"
            icon={<Wheat className="h-4 w-4" />}
            colorClass="text-amber-500"
          />
          <MacroProgress
            label="Lemak"
            current={totalLemak}
            target={targetLemak}
            unit="g"
            icon={<Droplets className="h-4 w-4" />}
            colorClass="text-blue-500"
          />
        </div>

        {/* Entry List */}
        {entries.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Makanan Hari Ini</div>
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{entry.nama}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.kalori} kkal • {entry.waktu}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveEntry(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Belum ada makanan tercatat hari ini.
            <br />
            Klik "Catat" pada resep untuk menambahkan.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
