import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { CalendarDays } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import { DailyNutrition } from "@/hooks/useDailyNutrition";

interface WeeklyNutritionChartProps {
  weeklyData: Record<string, DailyNutrition>;
  targetKalori: number;
}

const chartConfig = {
  kalori: {
    label: "Kalori",
    color: "hsl(var(--chart-1))",
  },
  protein: {
    label: "Protein",
    color: "hsl(var(--chart-2))",
  },
  karbohidrat: {
    label: "Karbohidrat", 
    color: "hsl(var(--chart-3))",
  },
  lemak: {
    label: "Lemak",
    color: "hsl(var(--chart-4))",
  },
};

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WeeklyNutritionChart({ weeklyData, targetKalori }: WeeklyNutritionChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = weeklyData[dateKey];
      
      data.push({
        day: dayNames[date.getDay()],
        date: dateKey,
        kalori: dayData?.totalKalori || 0,
        protein: dayData?.totalProtein || 0,
        karbohidrat: dayData?.totalKarbohidrat || 0,
        lemak: dayData?.totalLemak || 0,
      });
    }
    
    return data;
  }, [weeklyData]);

  const totalWeeklyKalori = chartData.reduce((sum, d) => sum + d.kalori, 0);
  const avgDailyKalori = Math.round(totalWeeklyKalori / 7);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Statistik Mingguan</CardTitle>
            <HelpTooltip content="Grafik nutrisi 7 hari terakhir" />
          </div>
          <div className="text-xs text-muted-foreground">
            Rata-rata: {avgDailyKalori} kkal/hari
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => {
                    const unit = name === "kalori" ? " kkal" : " g";
                    return [`${value}${unit}`, chartConfig[name as keyof typeof chartConfig]?.label || name];
                  }}
                />
              }
            />
            <Bar 
              dataKey="kalori" 
              fill="var(--color-kalori)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ChartContainer>

        {/* Macro Summary */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Kalori</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-1))" }}>
              {totalWeeklyKalori}
            </div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Protein</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-2))" }}>
              {chartData.reduce((sum, d) => sum + d.protein, 0)}g
            </div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Karbo</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-3))" }}>
              {chartData.reduce((sum, d) => sum + d.karbohidrat, 0)}g
            </div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Lemak</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-4))" }}>
              {chartData.reduce((sum, d) => sum + d.lemak, 0)}g
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
