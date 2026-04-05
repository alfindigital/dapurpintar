import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Flame, 
  Beef, 
  Wheat, 
  Droplets,
  Target,
  TrendingUp,
  Trophy,
  CalendarDays
} from "lucide-react";
import { DailyNutrition } from "@/hooks/useDailyNutrition";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { toast } from "sonner";

interface WeeklyNutritionReportProps {
  weeklyData: Record<string, DailyNutrition>;
  targetKalori: number;
  targetProtein?: number;
  targetKarbohidrat?: number;
  targetLemak?: number;
  waterStats: {
    streak: number;
    totalGlasses: number;
    avgGlasses: number;
    daysCompleted: number;
  };
  waterTarget: number;
}

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const shortDayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const chartConfig = {
  kalori: { color: "hsl(var(--chart-1))" },
  protein: { color: "hsl(var(--chart-2))" },
  karbohidrat: { color: "hsl(var(--chart-3))" },
  lemak: { color: "hsl(var(--chart-4))" },
};

export function WeeklyNutritionReport({
  weeklyData,
  targetKalori,
  targetProtein = 50,
  targetKarbohidrat = 250,
  targetLemak = 65,
  waterStats,
  waterTarget
}: WeeklyNutritionReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Process data for charts
  const chartData = (() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = weeklyData[dateKey];
      
      data.push({
        day: shortDayNames[date.getDay()],
        fullDay: dayNames[date.getDay()],
        date: dateKey,
        kalori: dayData?.totalKalori || 0,
        protein: dayData?.totalProtein || 0,
        karbohidrat: dayData?.totalKarbohidrat || 0,
        lemak: dayData?.totalLemak || 0,
      });
    }
    
    return data;
  })();

  // Calculate totals and averages
  const totals = {
    kalori: chartData.reduce((sum, d) => sum + d.kalori, 0),
    protein: chartData.reduce((sum, d) => sum + d.protein, 0),
    karbohidrat: chartData.reduce((sum, d) => sum + d.karbohidrat, 0),
    lemak: chartData.reduce((sum, d) => sum + d.lemak, 0),
  };

  const averages = {
    kalori: Math.round(totals.kalori / 7),
    protein: Math.round(totals.protein / 7),
    karbohidrat: Math.round(totals.karbohidrat / 7),
    lemak: Math.round(totals.lemak / 7),
  };

  const targets = {
    kalori: targetKalori,
    protein: targetProtein,
    karbohidrat: targetKarbohidrat,
    lemak: targetLemak,
  };

  const percentages = {
    kalori: targets.kalori > 0 ? Math.round((averages.kalori / targets.kalori) * 100) : 0,
    protein: targets.protein > 0 ? Math.round((averages.protein / targets.protein) * 100) : 0,
    karbohidrat: targets.karbohidrat > 0 ? Math.round((averages.karbohidrat / targets.karbohidrat) * 100) : 0,
    lemak: targets.lemak > 0 ? Math.round((averages.lemak / targets.lemak) * 100) : 0,
  };

  // Days meeting target
  const daysOnTarget = chartData.filter(d => 
    d.kalori >= targetKalori * 0.8 && d.kalori <= targetKalori * 1.2
  ).length;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const dateRange = `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const exportAsPDF = useCallback(async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Laporan Nutrisi Mingguan", pdfWidth / 2, 15, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(dateRange, pdfWidth / 2, 22, { align: "center" });
      
      // Add the captured content
      pdf.addImage(imgData, "PNG", 10, 28, pdfWidth - 20, pdfHeight - 20);
      
      pdf.save(`laporan-nutrisi-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Laporan PDF berhasil diunduh!");
      setIsOpen(false);
    } catch {
      toast.error("Gagal mengekspor laporan");
    } finally {
      setIsExporting(false);
    }
  }, [dateRange]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Export Laporan PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview Laporan Nutrisi
          </DialogTitle>
        </DialogHeader>

        {/* Report Content */}
        <div ref={reportRef} className="bg-background p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-3">
            <h2 className="text-lg font-bold text-foreground">Laporan Nutrisi Mingguan</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {dateRange}
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata Kalori</p>
                    <p className="text-xl font-bold text-orange-600">{averages.kalori} <span className="text-xs font-normal">kcal/hari</span></p>
                    <p className="text-xs text-muted-foreground">{percentages.kalori}% dari target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Beef className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata Protein</p>
                    <p className="text-xl font-bold text-blue-600">{averages.protein} <span className="text-xs font-normal">g/hari</span></p>
                    <p className="text-xs text-muted-foreground">{percentages.protein}% dari target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata Karbohidrat</p>
                    <p className="text-xl font-bold text-green-600">{averages.karbohidrat} <span className="text-xs font-normal">g/hari</span></p>
                    <p className="text-xs text-muted-foreground">{percentages.karbohidrat}% dari target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata Lemak</p>
                    <p className="text-xl font-bold text-purple-600">{averages.lemak} <span className="text-xs font-normal">g/hari</span></p>
                    <p className="text-xs text-muted-foreground">{percentages.lemak}% dari target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calories Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Grafik Kalori Harian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                  <Bar dataKey="kalori" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.kalori >= targetKalori * 0.8 && entry.kalori <= targetKalori * 1.2 
                          ? "hsl(var(--chart-2))" 
                          : "hsl(var(--chart-1))"
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-lg font-bold">{daysOnTarget}/7</p>
                <p className="text-xs text-muted-foreground">Hari Sesuai Target</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <Droplets className="h-5 w-5 mx-auto text-cyan-500 mb-1" />
                <p className="text-lg font-bold">{waterStats.streak}</p>
                <p className="text-xs text-muted-foreground">Streak Minum Air</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                <p className="text-lg font-bold">{waterStats.daysCompleted}/7</p>
                <p className="text-xs text-muted-foreground">Target Air Tercapai</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Detail Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                  <span>Hari</span>
                  <span className="text-right">Kalori</span>
                  <span className="text-right">Protein</span>
                  <span className="text-right">Karbo</span>
                  <span className="text-right">Lemak</span>
                </div>
                {chartData.map((day, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 text-xs py-1 border-b border-dashed last:border-0">
                    <span className="font-medium">{day.fullDay}</span>
                    <span className="text-right">{day.kalori} kcal</span>
                    <span className="text-right">{day.protein}g</span>
                    <span className="text-right">{day.karbohidrat}g</span>
                    <span className="text-right">{day.lemak}g</span>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold pt-2 border-t-2">
                  <span>Total</span>
                  <span className="text-right">{totals.kalori} kcal</span>
                  <span className="text-right">{totals.protein}g</span>
                  <span className="text-right">{totals.karbohidrat}g</span>
                  <span className="text-right">{totals.lemak}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end pt-2">
          <Button onClick={exportAsPDF} disabled={isExporting} className="gap-2">
            <Download className="h-4 w-4" />
            {isExporting ? "Mengunduh..." : "Unduh PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
