import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MealPlanPreferences, DEFAULT_MEAL_PREFERENCES, MealGoal, TingkatKesulitan } from "@/types/mealPlan";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { MEAL_GOAL_OPTIONS, DIFFICULTY_OPTIONS, BUDGET_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GeneratePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (preferences: MealPlanPreferences) => void;
  isGenerating: boolean;
  hasLockedSlots: boolean;
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const GeneratePlanDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  hasLockedSlots,
}: GeneratePlanDialogProps) => {
  const [preferences, setPreferences] = useState<MealPlanPreferences>(DEFAULT_MEAL_PREFERENCES);
  const [budgetInput, setBudgetInput] = useState<string>("");

  const handleGenerate = () => {
    onGenerate(preferences);
  };

  const handleBudgetChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setBudgetInput(numericValue);
    const parsed = parseInt(numericValue, 10);
    setPreferences({
      ...preferences,
      budgetHarian: isNaN(parsed) ? undefined : parsed,
    });
  };

  const handleBudgetPreset = (value: number) => {
    setBudgetInput(value.toString());
    setPreferences({ ...preferences, budgetHarian: value });
  };

  const totalMeals = 
    (preferences.includeSarapan ? 7 : 0) +
    (preferences.includeMakanSiang ? 7 : 0) +
    (preferences.includeMakanMalam ? 7 : 0);

  const weeklyBudget = preferences.budgetHarian ? preferences.budgetHarian * 7 : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Meal Plan
          </DialogTitle>
          <DialogDescription>
            AI akan membuat {totalMeals} menu unik untuk minggu ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meal times selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Waktu makan yang diisi:</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sarapan"
                  checked={preferences.includeSarapan}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, includeSarapan: !!checked })
                  }
                />
                <Label htmlFor="sarapan" className="font-normal cursor-pointer">
                  Sarapan (7 menu)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="makan_siang"
                  checked={preferences.includeMakanSiang}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, includeMakanSiang: !!checked })
                  }
                />
                <Label htmlFor="makan_siang" className="font-normal cursor-pointer">
                  Makan Siang (7 menu)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="makan_malam"
                  checked={preferences.includeMakanMalam}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, includeMakanMalam: !!checked })
                  }
                />
                <Label htmlFor="makan_malam" className="font-normal cursor-pointer">
                  Makan Malam (7 menu)
                </Label>
              </div>
            </div>
          </div>

          {/* Variasi */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tingkat variasi menu:</Label>
            <RadioGroup
              value={preferences.variasi}
              onValueChange={(v) => setPreferences({ ...preferences, variasi: v as "tinggi" | "sedang" | "rendah" })}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="tinggi" id="variasi-tinggi" />
                <Label htmlFor="variasi-tinggi" className="font-normal cursor-pointer">
                  Tinggi - Menu sangat bervariasi
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sedang" id="variasi-sedang" />
                <Label htmlFor="variasi-sedang" className="font-normal cursor-pointer">
                  Sedang - Variasi wajar
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="rendah" id="variasi-rendah" />
                <Label htmlFor="variasi-rendah" className="font-normal cursor-pointer">
                  Rendah - Menu sederhana & familiar
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Budget Harian */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">💰 Budget Harian (opsional):</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rp</span>
                <Input
                  type="text"
                  placeholder="Contoh: 50000"
                  value={budgetInput}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="flex-1"
                />
              </div>
              {weeklyBudget && (
                <p className="text-xs text-muted-foreground">
                  = Rp {formatRupiah(weeklyBudget)}/minggu
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((preset) => (
                  <Badge
                    key={preset.value}
                    variant={preferences.budgetHarian === preset.value ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleBudgetPreset(preset.value)}
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Meal Goal */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">🎯 Tujuan Menu:</Label>
            <div className="flex flex-wrap gap-2">
              {MEAL_GOAL_OPTIONS.map((option) => (
                <Badge
                  key={option.id}
                  variant={preferences.mealGoal === option.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    preferences.mealGoal === option.id && "bg-primary"
                  )}
                  onClick={() => setPreferences({ ...preferences, mealGoal: option.id as MealGoal })}
                >
                  {option.label}
                  <span className="ml-1 text-xs opacity-70">({option.desc})</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">👨‍🍳 Tingkat Kesulitan:</Label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <Badge
                  key={option.id}
                  variant={preferences.tingkatKesulitan === option.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    preferences.tingkatKesulitan === option.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setPreferences({ ...preferences, tingkatKesulitan: option.id as TingkatKesulitan })}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Regional preference */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="prioritasDaerah"
              checked={preferences.prioritasDaerah}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, prioritasDaerah: !!checked })
              }
            />
            <Label htmlFor="prioritasDaerah" className="font-normal cursor-pointer">
              Prioritaskan masakan daerah (sesuai profil)
            </Label>
          </div>

          {hasLockedSlots && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              ℹ️ Menu yang dikunci tidak akan diganti
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Batal
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || totalMeals === 0}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {totalMeals} Menu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
