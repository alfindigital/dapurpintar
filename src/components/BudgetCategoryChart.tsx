import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUDGET_CATEGORIES, KategoriBiaya } from "@/types/mealPlan";

interface BudgetCategoryChartProps {
  categoryBreakdown: Record<KategoriBiaya, number>;
  compact?: boolean;
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

export const BudgetCategoryChart = ({ categoryBreakdown, compact = false }: BudgetCategoryChartProps) => {
  const chartData = useMemo(() => {
    return BUDGET_CATEGORIES
      .map(cat => ({
        name: cat.label,
        value: categoryBreakdown[cat.key],
        color: cat.color,
      }))
      .filter(item => item.value > 0);
  }, [categoryBreakdown]);

  const total = useMemo(() => {
    return Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);
  }, [categoryBreakdown]);

  if (total === 0) {
    return (
      <Card>
        <CardHeader className={compact ? "p-3" : "p-4"}>
          <CardTitle className="text-sm font-medium">Distribusi Biaya</CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Belum ada data biaya
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? "p-3" : "p-4"}>
        <CardTitle className="text-sm font-medium">Distribusi Biaya</CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className={compact ? "h-40" : "h-56"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 30 : 50}
                outerRadius={compact ? 50 : 80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatRupiah(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              {!compact && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-foreground">{value}</span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className={`grid gap-1 ${compact ? "grid-cols-2 mt-2" : "grid-cols-1 mt-4"}`}>
          {BUDGET_CATEGORIES.map(cat => {
            const value = categoryBreakdown[cat.key];
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            
            return (
              <div key={cat.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatRupiah(value)}</span>
                  <span className="text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
