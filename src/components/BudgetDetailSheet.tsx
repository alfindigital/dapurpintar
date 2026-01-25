import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BudgetCategoryChart } from "./BudgetCategoryChart";
import { BudgetEntry, BudgetSettings, KategoriBiaya } from "@/types/mealPlan";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BudgetDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetHistory: BudgetEntry[];
  categoryBreakdown: Record<KategoriBiaya, number>;
  settings: BudgetSettings;
  monthlyTotal: number;
}

const formatRupiah = (value: number): string => {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

export const BudgetDetailSheet = ({
  open,
  onOpenChange,
  budgetHistory,
  categoryBreakdown,
  settings,
  monthlyTotal,
}: BudgetDetailSheetProps) => {
  const remaining = settings.budgetBulanan 
    ? settings.budgetBulanan - monthlyTotal 
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detail Budget</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          <div className="space-y-6">
            {/* Monthly Summary */}
            {settings.budgetBulanan && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Ringkasan Bulan Ini</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Terpakai</p>
                    <p className="text-lg font-bold">{formatRupiah(monthlyTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-lg font-bold">{formatRupiah(settings.budgetBulanan)}</p>
                  </div>
                </div>
                {remaining !== null && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Sisa</p>
                    <p className={`text-lg font-bold ${remaining < 0 ? "text-destructive" : "text-primary"}`}>
                      {remaining < 0 ? "-" : ""}{formatRupiah(Math.abs(remaining))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Category Chart */}
            <BudgetCategoryChart categoryBreakdown={categoryBreakdown} />

            {/* Weekly History */}
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Riwayat Mingguan
              </p>
              
              {budgetHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada riwayat budget
                </p>
              ) : (
                <div className="space-y-2">
                  {budgetHistory.map((entry, index) => {
                    const prevEntry = budgetHistory[index + 1];
                    const diff = prevEntry 
                      ? entry.totalEstimasi - prevEntry.totalEstimasi 
                      : 0;
                    
                    const endDate = new Date(entry.weekStart);
                    endDate.setDate(endDate.getDate() + 6);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(entry.weekStart)} - {formatDate(endDate.toISOString())}
                          </p>
                          {entry.targetBudget && (
                            <p className="text-xs text-muted-foreground">
                              Target: {formatRupiah(entry.targetBudget)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatRupiah(entry.totalEstimasi)}</p>
                          {prevEntry && (
                            <div className="flex items-center gap-1 text-xs justify-end">
                              {diff > 0 ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-destructive" />
                                  <span className="text-destructive">+{formatRupiah(diff)}</span>
                                </>
                              ) : diff < 0 ? (
                                <>
                                  <TrendingDown className="h-3 w-3 text-primary" />
                                  <span className="text-primary">{formatRupiah(diff)}</span>
                                </>
                              ) : (
                                <>
                                  <Minus className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Sama</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
