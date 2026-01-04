import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, TrendingUp, Trophy, Flame } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailyWaterRecord {
  date: string;
  glasses: number;
  target: number;
}

interface WeeklyWaterChartProps {
  weeklyData: DailyWaterRecord[];
  stats: {
    totalGlasses: number;
    avgGlasses: number;
    daysCompleted: number;
    streak: number;
  };
  target: number;
}

const chartConfig = {
  glasses: {
    label: "Gelas",
    color: "hsl(210, 100%, 60%)",
  },
} satisfies ChartConfig;

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WeeklyWaterChart({ weeklyData, stats, target }: WeeklyWaterChartProps) {
  const chartData = useMemo(() => {
    return weeklyData.map(d => {
      const date = new Date(d.date);
      const dayName = dayNames[date.getDay()];
      const isToday = d.date === new Date().toISOString().split('T')[0];
      
      return {
        ...d,
        dayName: isToday ? "Hari ini" : dayName,
        isComplete: d.glasses >= d.target,
      };
    });
  }, [weeklyData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Statistik Mingguan Air
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-center">
            <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stats.totalGlasses}
            </div>
            <div className="text-[10px] text-muted-foreground">Total Gelas</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.avgGlasses}
            </div>
            <div className="text-[10px] text-muted-foreground">Rata-rata</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 text-center">
            <Trophy className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {stats.daysCompleted}/7
            </div>
            <div className="text-[10px] text-muted-foreground">Target</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-2 text-center">
            <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {stats.streak}
            </div>
            <div className="text-[10px] text-muted-foreground">Streak</div>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="dayName" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                domain={[0, Math.max(target + 2, Math.max(...chartData.map(d => d.glasses)) + 1)]}
              />
              <ReferenceLine 
                y={target} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Target: ${target}`, 
                  position: "right", 
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))"
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span>{value} gelas</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isComplete ? "hsl(142, 76%, 46%)" : "hsl(210, 100%, 60%)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Belum tercapai</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Target tercapai</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
