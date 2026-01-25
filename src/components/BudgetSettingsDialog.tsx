import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BudgetSettings } from "@/types/mealPlan";
import { useState, useEffect } from "react";
import { Wallet, Bell, AlertTriangle } from "lucide-react";

interface BudgetSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: BudgetSettings;
  onSave: (settings: Partial<BudgetSettings>) => void;
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const parseRupiah = (str: string): number => {
  return parseInt(str.replace(/\D/g, "")) || 0;
};

const BUDGET_PRESETS = [
  { label: "Rp 500k", value: 500000 },
  { label: "Rp 1 jt", value: 1000000 },
  { label: "Rp 1.5 jt", value: 1500000 },
  { label: "Rp 2 jt", value: 2000000 },
  { label: "Rp 3 jt", value: 3000000 },
];

export const BudgetSettingsDialog = ({
  open,
  onOpenChange,
  settings,
  onSave,
}: BudgetSettingsDialogProps) => {
  const [budgetInput, setBudgetInput] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(settings.alertThreshold);
  const [enableAlerts, setEnableAlerts] = useState(settings.enableAlerts);

  useEffect(() => {
    if (open) {
      setBudgetInput(settings.budgetBulanan ? formatRupiah(settings.budgetBulanan) : "");
      setAlertThreshold(settings.alertThreshold);
      setEnableAlerts(settings.enableAlerts);
    }
  }, [open, settings]);

  const handleBudgetChange = (value: string) => {
    const numericValue = parseRupiah(value);
    if (numericValue > 0) {
      setBudgetInput(formatRupiah(numericValue));
    } else {
      setBudgetInput("");
    }
  };

  const handlePresetClick = (value: number) => {
    setBudgetInput(formatRupiah(value));
  };

  const handleSave = () => {
    const budgetValue = parseRupiah(budgetInput);
    onSave({
      budgetBulanan: budgetValue > 0 ? budgetValue : undefined,
      alertThreshold,
      enableAlerts,
    });
    onOpenChange(false);
  };

  const weeklyEstimate = parseRupiah(budgetInput) > 0 
    ? Math.round(parseRupiah(budgetInput) / 4) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Pengaturan Budget
          </DialogTitle>
          <DialogDescription>
            Atur target budget bulanan dan notifikasi peringatan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Monthly Budget */}
          <div className="space-y-3">
            <Label htmlFor="budget">Budget Bulanan</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                id="budget"
                value={budgetInput.replace(/^Rp\s*/, "")}
                onChange={(e) => handleBudgetChange(e.target.value)}
                placeholder="0"
                className="pl-10"
              />
            </div>
            
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {weeklyEstimate > 0 && (
              <p className="text-xs text-muted-foreground">
                ≈ Rp {formatRupiah(weeklyEstimate)} per minggu
              </p>
            )}
          </div>

          {/* Alert Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="alerts">Notifikasi Peringatan</Label>
              </div>
              <Switch
                id="alerts"
                checked={enableAlerts}
                onCheckedChange={setEnableAlerts}
              />
            </div>

            {enableAlerts && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <Label className="text-sm">Peringatkan saat mencapai</Label>
                  </div>
                  <span className="text-sm font-medium">{alertThreshold}%</span>
                </div>
                <Slider
                  value={[alertThreshold]}
                  onValueChange={([value]) => setAlertThreshold(value)}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Peringatan akan muncul saat pengeluaran mencapai {alertThreshold}% dari budget
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
