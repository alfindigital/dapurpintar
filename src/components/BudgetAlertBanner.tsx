import { AlertTriangle, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BudgetAlertBannerProps {
  alertStatus: {
    isWarning: boolean;
    isOver: boolean;
    percentage: number;
  };
  monthlyTotal: number;
  budgetBulanan: number;
  onSettingsClick: () => void;
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const BudgetAlertBanner = ({
  alertStatus,
  monthlyTotal,
  budgetBulanan,
  onSettingsClick,
}: BudgetAlertBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (!alertStatus.isWarning && !alertStatus.isOver)) {
    return null;
  }

  const remaining = budgetBulanan - monthlyTotal;
  const isOver = alertStatus.isOver;

  return (
    <div
      className={cn(
        "relative rounded-lg p-3 flex items-start gap-3",
        isOver 
          ? "bg-destructive/10 border border-destructive/30" 
          : "bg-accent/10 border border-accent/30"
      )}
    >
      <div className={cn(
        "flex-shrink-0 p-1.5 rounded-full",
        isOver ? "bg-destructive/20" : "bg-accent/20"
      )}>
        {isOver ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <TrendingUp className="h-4 w-4 text-accent" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm",
          isOver ? "text-destructive" : "text-accent"
        )}>
          {isOver ? "Budget Bulan Ini Terlampaui!" : "Mendekati Batas Budget"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isOver ? (
            <>
              Pengeluaran melebihi Rp {formatRupiah(budgetBulanan)} 
              sebesar Rp {formatRupiah(Math.abs(remaining))}
            </>
          ) : (
            <>
              {alertStatus.percentage}% budget terpakai. 
              Sisa Rp {formatRupiah(remaining)} untuk bulan ini.
            </>
          )}
        </p>
        <Button
          variant="link"
          size="sm"
          className={cn(
            "h-auto p-0 mt-1 text-xs",
            isOver ? "text-destructive" : "text-accent"
          )}
          onClick={onSettingsClick}
        >
          Sesuaikan budget →
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
