import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";
import { Scale, TrendingUp, TrendingDown, Minus, Plus, Trash2 } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeightTracking } from "@/hooks/useWeightTracking";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeightAchievements } from "./WeightAchievements";

interface WeightProgressChartProps {
  targetWeight?: number;
}

const chartConfig = {
  weight: {
    label: "Berat",
    color: "hsl(var(--chart-1))",
  },
};

export function WeightProgressChart({ targetWeight }: WeightProgressChartProps) {
  const { entries, addEntry, removeEntry, getLast30Days, getStats } = useWeightTracking();
  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const chartData = getLast30Days();
  const stats = getStats();

  // Filter out null values for the line chart
  const validData = chartData.filter(d => d.weight !== null);

  const handleAddEntry = useCallback(() => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 20 || weight > 300) {
      toast.error("Masukkan berat yang valid (20-300 kg)");
      return;
    }
    addEntry(weight, newNote || undefined);
    setNewWeight("");
    setNewNote("");
    setDialogOpen(false);
    toast.success("Berat badan tercatat!");
  }, [newWeight, newNote, addEntry]);

  const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stats.trend === 'up' ? 'text-orange-500' : stats.trend === 'down' ? 'text-green-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Progress Berat Badan</CardTitle>
            <HelpTooltip content="Tracking perubahan berat badan 30 hari terakhir" />
          </div>
          <div className="flex items-center gap-2">
            {/* History Button */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Riwayat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Riwayat Berat Badan</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                  {entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Belum ada data</p>
                  ) : (
                    <div className="space-y-2">
                      {[...entries].reverse().map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div>
                            <div className="font-medium">{entry.weight} kg</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                            {entry.note && (
                              <div className="text-xs text-muted-foreground mt-1">{entry.note}</div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              removeEntry(entry.id);
                              toast.success("Data dihapus");
                            }}
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
            {/* Add Entry Button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  Catat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catat Berat Badan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight-input">Berat Badan (kg)</Label>
                    <Input
                      id="weight-input"
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      placeholder="Contoh: 65.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight-note">Catatan (opsional)</Label>
                    <Input
                      id="weight-note"
                      placeholder="Contoh: Setelah olahraga"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddEntry} className="w-full">
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress to Target */}
        {targetWeight && stats.current && (
          <div className="p-3 rounded-lg border bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress Menuju Target</span>
              <Badge variant={Math.abs(stats.current - targetWeight) < 0.5 ? "default" : "secondary"} className="text-xs">
                {Math.abs(stats.current - targetWeight) < 0.5 
                  ? "🎉 Tercapai!" 
                  : stats.current > targetWeight 
                    ? `${(stats.current - targetWeight).toFixed(1)} kg lagi`
                    : `${(targetWeight - stats.current).toFixed(1)} kg lagi`
                }
              </Badge>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {(() => {
                const initial = stats.initial || stats.current;
                const totalToLose = Math.abs(initial - targetWeight);
                const currentProgress = Math.abs(initial - stats.current);
                const percentage = totalToLose > 0 ? Math.min(100, (currentProgress / totalToLose) * 100) : 100;
                return (
                  <div 
                    className="absolute h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                );
              })()}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{stats.initial} kg</span>
              <span className="font-medium text-primary">{targetWeight} kg</span>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Awal</div>
            <div className="text-sm font-semibold">
              {stats.initial ? `${stats.initial} kg` : '-'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Saat Ini</div>
            <div className="text-sm font-semibold">
              {stats.current ? `${stats.current} kg` : '-'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Perubahan</div>
            <div className={`text-sm font-semibold flex items-center justify-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {stats.change !== null ? `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)} kg` : '-'}
            </div>
          </div>
        </div>

        {/* Chart */}
        {validData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <LineChart data={validData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                width={40}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [`${value} kg`, 'Berat']}
                  />
                }
              />
              {targetWeight && (
                <ReferenceLine 
                  y={targetWeight} 
                  stroke="hsl(var(--primary))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ 
                    value: `Target: ${targetWeight} kg`, 
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--primary))"
                  }}
                />
              )}
              <Line 
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
            <Scale className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Minimal 2 data untuk menampilkan grafik</p>
            <p className="text-xs">Klik "Catat" untuk mulai tracking</p>
          </div>
        )}

        {/* Target Badge */}
        {targetWeight && (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs">
              Target: {targetWeight} kg
            </Badge>
          </div>
        )}

        {/* Weight Achievements */}
        <WeightAchievements
          initialWeight={stats.initial}
          currentWeight={stats.current}
          targetWeight={targetWeight}
          totalEntries={entries.length}
        />
      </CardContent>
    </Card>
  );
}
