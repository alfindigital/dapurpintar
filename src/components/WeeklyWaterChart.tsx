import { useMemo, useRef, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Droplets, TrendingUp, Trophy, Flame, Download, Image, FileText, Share2, MessageCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportAsImage = useCallback(async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `statistik-air-${new Date().toISOString().split("T")[0]}.png`;
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
        orientation: "landscape",
        unit: "mm",
        format: "a5",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`statistik-air-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal mengekspor PDF");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const getShareText = useCallback(() => {
    return `💧 Progress Minum Air Mingguanku!\n\n🥛 Total: ${stats.totalGlasses} gelas\n📊 Rata-rata: ${stats.avgGlasses} gelas/hari\n🏆 Target tercapai: ${stats.daysCompleted}/7 hari\n🔥 Streak: ${stats.streak} hari\n\n#HidrasiSehat #WaterChallenge`;
  }, [stats]);

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

  return (
    <Card ref={chartRef}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Statistik Mingguan Air
          </CardTitle>
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
          </div>
        </div>
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
