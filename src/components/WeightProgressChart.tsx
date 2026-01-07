import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";
import { Scale, TrendingUp, TrendingDown, Minus, Plus, Trash2, Share2, Download, Image, FileText, MessageCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeightTracking } from "@/hooks/useWeightTracking";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeightAchievements } from "./WeightAchievements";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = getLast30Days();
  const stats = getStats();

  // Filter out null values for the line chart
  const validData = chartData.filter(d => d.weight !== null);

  // Share and Export functions
  const getShareText = useCallback(() => {
    const changeText = stats.change !== null 
      ? `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)} kg` 
      : 'belum ada perubahan';
    const targetText = targetWeight 
      ? `\n🎯 Target: ${targetWeight} kg` 
      : '';
    return `⚖️ Progress Berat Badanku!\n\n📊 Berat Awal: ${stats.initial ? stats.initial + ' kg' : '-'}\n💪 Berat Saat Ini: ${stats.current ? stats.current + ' kg' : '-'}\n📈 Perubahan: ${changeText}${targetText}\n📅 Total catatan: ${entries.length} hari\n\n#ProgressBerat #HealthyLifestyle`;
  }, [stats, targetWeight, entries.length]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    toast.success("Membuka Twitter...");
  }, [getShareText]);

  const shareToFacebook = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, "_blank");
    toast.success("Membuka Facebook...");
  }, [getShareText]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("Membuka WhatsApp...");
  }, [getShareText]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      toast.success("Teks berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin teks");
    }
  }, [getShareText]);

  const exportAsImage = useCallback(async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `progress-berat-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Gambar berhasil diunduh!");
    } catch {
      toast.error("Gagal mengekspor gambar");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportAsPDF = useCallback(async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`progress-berat-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal mengekspor PDF");
    } finally {
      setIsExporting(false);
    }
  }, []);

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
    <Card ref={chartRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Progress Berat Badan</CardTitle>
            <HelpTooltip content="Tracking perubahan berat badan 30 hari terakhir" />
          </div>
          <div className="flex items-center gap-1">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={isExporting}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportAsImage}>
                  <Image className="h-4 w-4 mr-2" />
                  Unduh Gambar (PNG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Unduh PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Share Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareToTwitter}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter / X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToFacebook}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyToClipboard}>
                  <FileText className="h-4 w-4 mr-2" />
                  Salin Teks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
