import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetEntry, BudgetSettings } from "@/types/mealPlan";

interface BudgetOverviewCardProps {
  currentWeekBudget: BudgetEntry | null;
  monthlyTotal: number;
  settings: BudgetSettings;
  alertStatus: {
    isWarning: boolean;
    isOver: boolean;
    percentage: number;
  };
  onSettingsClick: () => void;
  onDetailClick: () => void;
  previousWeekBudget?: BudgetEntry | null;
}

const formatRupiah = (value: number): string => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)} jt`;
  }
  if (value >= 1000) {
    return `Rp ${Math.round(value / 1000)}k`;
  }
  return `Rp ${value}`;
};

export const BudgetOverviewCard = ({
  currentWeekBudget,
  monthlyTotal,
  settings,
  alertStatus,
  onSettingsClick,
  onDetailClick,
  previousWeekBudget,
}: BudgetOverviewCardProps) => {
  const weeklyTarget = settings.budgetBulanan ? Math.round(settings.budgetBulanan / 4) : null;
  const weeklyProgress = weeklyTarget && currentWeekBudget 
    ? Math.min(100, (currentWeekBudget.totalEstimasi / weeklyTarget) * 100)
    : 0;

  const weeklyDiff = previousWeekBudget && currentWeekBudget
    ? currentWeekBudget.totalEstimasi - previousWeekBudget.totalEstimasi
    : null;

  const getStatusColor = () => {
    if (alertStatus.isOver) return "text-destructive";
    if (alertStatus.isWarning) return "text-warning";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (weeklyProgress >= 100) return "bg-destructive";
    if (weeklyProgress >= 80) return "bg-warning";
    return "";
  };

  if (!currentWeekBudget && !settings.budgetBulanan) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Budget Tracker</p>
              <p className="text-xs text-muted-foreground">
                Atur budget bulanan untuk tracking pengeluaran
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onSettingsClick}>
            <Settings2 className="h-4 w-4 mr-1" />
            Atur
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-colors",
      alertStatus.isOver && "border-destructive/50 bg-destructive/5",
      alertStatus.isWarning && "border-warning/50 bg-warning/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Weekly estimate */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className={cn("h-4 w-4", getStatusColor())} />
              <span className="text-sm font-medium">Estimasi Minggu Ini</span>
              {alertStatus.isWarning && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              {alertStatus.isOver && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-bold", getStatusColor())}>
                {formatRupiah(currentWeekBudget?.totalEstimasi || 0)}
              </span>
              {weeklyTarget && (
                <span className="text-sm text-muted-foreground">
                  / {formatRupiah(weeklyTarget)}
                </span>
              )}
            </div>

            {weeklyTarget && (
              <Progress 
                value={weeklyProgress} 
                className={cn("h-2 mt-2", getProgressColor())}
              />
            )}

            {weeklyDiff !== null && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                {weeklyDiff > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">
                      +{formatRupiah(weeklyDiff)} dari minggu lalu
                    </span>
                  </>
                ) : weeklyDiff < 0 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-primary" />
                    <span className="text-primary">
                      {formatRupiah(Math.abs(weeklyDiff))} lebih hemat
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sama dengan minggu lalu</span>
                )}
              </div>
            )}
          </div>

          {/* Right: Monthly summary */}
          {settings.budgetBulanan && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Bulan Ini</p>
              <p className="text-lg font-semibold">{formatRupiah(monthlyTotal)}</p>
              <p className="text-xs text-muted-foreground">
                / {formatRupiah(settings.budgetBulanan)}
              </p>
              <p className={cn("text-xs font-medium mt-1", getStatusColor())}>
                {alertStatus.percentage}% terpakai
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={onDetailClick}
          >
            Lihat Detail
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onSettingsClick}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
