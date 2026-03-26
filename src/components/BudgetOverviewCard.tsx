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
  return `Rp ${value.toLocaleString('id-ID')}`;
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
    if (alertStatus.isWarning) return "text-accent";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (weeklyProgress >= 100) return "bg-destructive";
    if (weeklyProgress >= 80) return "bg-accent";
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
      alertStatus.isWarning && "border-accent/50 bg-accent/5"
    )}>
      <CardContent className="p-4">
        {/* Top row: Two summary boxes */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Pengeluaran</p>
            <p className={cn("text-lg font-bold whitespace-nowrap", getStatusColor())}>
              {formatRupiah(currentWeekBudget?.totalEstimasi || 0)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Budget Bulanan</p>
            <p className="text-lg font-bold whitespace-nowrap">
              {settings.budgetBulanan ? formatRupiah(settings.budgetBulanan) : "-"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {settings.budgetBulanan && (
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Penggunaan Budget</span>
              <span className={cn("text-sm font-semibold", getStatusColor())}>
                {alertStatus.percentage}%
              </span>
            </div>
            <Progress 
              value={Math.min(100, alertStatus.percentage)} 
              className={cn("h-2", getProgressColor())}
            />
            <p className="text-xs text-primary font-medium mt-2">
              Sisa: {formatRupiah(Math.max(0, (settings.budgetBulanan || 0) - monthlyTotal))}
            </p>
          </div>
        )}

        {/* Week comparison */}
        {weeklyDiff !== null && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {weeklyDiff > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-destructive" />
                <span className="text-destructive">+{formatRupiah(weeklyDiff)} dari minggu lalu</span>
              </>
            ) : weeklyDiff < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-primary" />
                <span className="text-primary">{formatRupiah(Math.abs(weeklyDiff))} lebih hemat</span>
              </>
            ) : (
              <span className="text-muted-foreground">Sama dengan minggu lalu</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onDetailClick}>
            Lihat Detail
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSettingsClick}>
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
