import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ReferenceLine } from "recharts";
import { CalendarDays, Flame, Beef, Wheat, Droplets, BarChart3, TrendingUp } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import { DailyNutrition } from "@/hooks/useDailyNutrition";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface WeeklyNutritionChartProps {
  weeklyData: Record<string, DailyNutrition>;
  targetKalori: number;
  targetProtein?: number;
  targetKarbohidrat?: number;
  targetLemak?: number;
}

type MacroType = "kalori" | "protein" | "karbohidrat" | "lemak";
type ChartType = "bar" | "line";

const chartConfig = {
  kalori: {
    label: "Kalori",
    color: "hsl(var(--chart-1))",
    icon: Flame,
    unit: "kkal",
  },
  protein: {
    label: "Protein",
    color: "hsl(var(--chart-2))",
    icon: Beef,
    unit: "g",
  },
  karbohidrat: {
    label: "Karbohidrat", 
    color: "hsl(var(--chart-3))",
    icon: Wheat,
    unit: "g",
  },
  lemak: {
    label: "Lemak",
    color: "hsl(var(--chart-4))",
    icon: Droplets,
    unit: "g",
  },
};

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WeeklyNutritionChart({ 
  weeklyData, 
  targetKalori, 
  targetProtein = 50, 
  targetKarbohidrat = 250, 
  targetLemak = 65 
}: WeeklyNutritionChartProps) {
  const [activeMacro, setActiveMacro] = useState<MacroType>("kalori");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const targets: Record<MacroType, number> = {
    kalori: targetKalori,
    protein: targetProtein,
    karbohidrat: targetKarbohidrat,
    lemak: targetLemak,
  };

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

  const totals = useMemo(() => ({
    kalori: chartData.reduce((sum, d) => sum + d.kalori, 0),
    protein: chartData.reduce((sum, d) => sum + d.protein, 0),
    karbohidrat: chartData.reduce((sum, d) => sum + d.karbohidrat, 0),
    lemak: chartData.reduce((sum, d) => sum + d.lemak, 0),
  }), [chartData]);

  const activeConfig = chartConfig[activeMacro];
  const avgDaily = Math.round(totals[activeMacro] / 7);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Statistik Mingguan</CardTitle>
            <HelpTooltip content="Grafik nutrisi 7 hari terakhir" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Rata-rata: {avgDaily} {activeConfig.unit}/hari
            </div>
            {/* Chart Type Toggle */}
            <ToggleGroup 
              type="single" 
              value={chartType} 
              onValueChange={(v) => v && setChartType(v as ChartType)}
              size="sm"
            >
              <ToggleGroupItem value="bar" className="h-7 w-7 p-0">
                <BarChart3 className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="line" className="h-7 w-7 p-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Macro Toggle */}
        <ToggleGroup 
          type="single" 
          value={activeMacro} 
          onValueChange={(v) => v && setActiveMacro(v as MacroType)}
          className="justify-start gap-1"
        >
          {(Object.keys(chartConfig) as MacroType[]).map((key) => {
            const config = chartConfig[key];
            const Icon = config.icon;
            return (
              <ToggleGroupItem
                key={key}
                value={key}
                size="sm"
                className="text-xs gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          {chartType === "bar" ? (
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
                    formatter={(value) => {
                      return [`${value} ${activeConfig.unit}`, activeConfig.label];
                    }}
                  />
                }
              />
              <ReferenceLine 
                y={targets[activeMacro]} 
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: `Target: ${targets[activeMacro]}${activeConfig.unit}`, 
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(var(--destructive))"
                }}
              />
              <Bar 
                dataKey={activeMacro}
                fill={activeConfig.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(value) => {
                      return [`${value} ${activeConfig.unit}`, activeConfig.label];
                    }}
                  />
                }
              />
              <ReferenceLine 
                y={targets[activeMacro]} 
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: `Target: ${targets[activeMacro]}${activeConfig.unit}`, 
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(var(--destructive))"
                }}
              />
              <Line 
                type="monotone"
                dataKey={activeMacro}
                stroke={activeConfig.color}
                strokeWidth={2}
                dot={{ fill: activeConfig.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ChartContainer>

        {/* Macro Summary */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {(Object.keys(chartConfig) as MacroType[]).map((key) => {
            const config = chartConfig[key];
            const isActive = key === activeMacro;
            return (
              <button
                key={key}
                onClick={() => setActiveMacro(key)}
                className={`p-2 rounded transition-colors ${
                  isActive ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="text-xs text-muted-foreground">{config.label}</div>
                <div className="text-sm font-semibold" style={{ color: config.color }}>
                  {totals[key]}{config.unit === "kkal" ? "" : "g"}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
