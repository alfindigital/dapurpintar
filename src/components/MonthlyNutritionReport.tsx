import { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Download, Loader2, Target, TrendingUp, Utensils, Trophy,
  Flame, Drumstick, Wheat, Droplets, Scale, Award, Lightbulb,
  Calendar, BarChart3, PieChart, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { DailyNutrition } from '@/hooks/useDailyNutrition';
import { WeightEntry } from '@/hooks/useWeightTracking';
import { 
  analyzeNutritionPattern, 
  generateRecommendations, 
  calculateOverallScore,
  NutritionTargets 
} from '@/lib/nutritionAnalysis';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface MonthlyNutritionReportProps {
  monthlyData: Record<string, DailyNutrition>;
  targetKalori: number;
  targetProtein?: number;
  targetKarbohidrat?: number;
  targetLemak?: number;
  weightEntries: WeightEntry[];
  targetWeight?: number;
  waterStats: {
    streak: number;
    daysCompleted: number;
    avgGlasses: number;
  };
  waterTarget: number;
  unlockedWaterAchievements: string[];
  unlockedWeightAchievements: string[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function MonthlyNutritionReport({
  monthlyData,
  targetKalori,
  targetProtein = 50,
  targetKarbohidrat = 250,
  targetLemak = 65,
  weightEntries,
  targetWeight,
  waterStats,
  waterTarget,
  unlockedWaterAchievements,
  unlockedWeightAchievements,
}: MonthlyNutritionReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('ringkasan');
  const reportRef = useRef<HTMLDivElement>(null);

  const targets: NutritionTargets = {
    kalori: targetKalori,
    protein: targetProtein,
    karbohidrat: targetKarbohidrat,
    lemak: targetLemak,
  };

  const pattern = useMemo(() => 
    analyzeNutritionPattern(monthlyData, targets),
    [monthlyData, targets]
  );

  const weightProgress = useMemo(() => {
    if (weightEntries.length < 2 || !targetWeight) return null;
    const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const initial = sorted[0].weight;
    const current = sorted[sorted.length - 1].weight;
    const totalToLose = initial - targetWeight;
    if (totalToLose === 0) return 100;
    const lost = initial - current;
    return Math.max(0, Math.min(100, (lost / totalToLose) * 100));
  }, [weightEntries, targetWeight]);

  const weightTrend = useMemo(() => {
    if (weightEntries.length < 2) return 'stable' as const;
    const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const diff = sorted[sorted.length - 1].weight - sorted[0].weight;
    if (diff > 0.5) return 'up' as const;
    if (diff < -0.5) return 'down' as const;
    return 'stable' as const;
  }, [weightEntries]);

  const recommendations = useMemo(() => 
    generateRecommendations({
      pattern,
      targets,
      waterStreak: waterStats.streak,
      waterDaysCompleted: waterStats.daysCompleted,
      weightProgress,
      weightTrend,
    }),
    [pattern, targets, waterStats, weightProgress, weightTrend]
  );

  const overallScore = useMemo(() => 
    calculateOverallScore(pattern, waterStats.daysCompleted),
    [pattern, waterStats.daysCompleted]
  );

  // Chart data
  const dailyChartData = useMemo(() => {
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        kalori: data.totalKalori,
        target: targetKalori,
      }));
  }, [monthlyData, targetKalori]);

  const macroChartData = useMemo(() => [
    { name: 'Protein', value: pattern.avgProteinRatio, color: 'hsl(var(--primary))' },
    { name: 'Karbo', value: pattern.avgCarbRatio, color: 'hsl(var(--chart-2))' },
    { name: 'Lemak', value: pattern.avgFatRatio, color: 'hsl(var(--chart-3))' },
  ], [pattern]);

  const mealTimeData = useMemo(() => [
    { name: 'Sarapan', rate: pattern.breakfastRate },
    { name: 'Makan Siang', rate: pattern.lunchRate },
    { name: 'Makan Malam', rate: pattern.dinnerRate },
  ], [pattern]);

  const weightChartData = useMemo(() => {
    if (weightEntries.length === 0) return [];
    return [...weightEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        berat: entry.weight,
        target: targetWeight,
      }));
  }, [weightEntries, targetWeight]);

  // Date range
  const dateRange = useMemo(() => {
    const dates = Object.keys(monthlyData).sort();
    if (dates.length === 0) return 'Tidak ada data';
    const start = new Date(dates[0]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
    const end = new Date(dates[dates.length - 1]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${start} - ${end}`;
  }, [monthlyData]);

  // Averages
  const averages = useMemo(() => {
    const dates = Object.keys(monthlyData).filter(d => monthlyData[d].entries.length > 0);
    if (dates.length === 0) return { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 };
    
    return {
      kalori: Math.round(dates.reduce((s, d) => s + monthlyData[d].totalKalori, 0) / dates.length),
      protein: Math.round(dates.reduce((s, d) => s + monthlyData[d].totalProtein, 0) / dates.length),
      karbohidrat: Math.round(dates.reduce((s, d) => s + monthlyData[d].totalKarbohidrat, 0) / dates.length),
      lemak: Math.round(dates.reduce((s, d) => s + monthlyData[d].totalLemak, 0) / dates.length),
    };
  }, [monthlyData]);

  const exportAsPDF = useCallback(async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Get all tab contents
      const tabs = ['ringkasan', 'grafik', 'pola', 'rekomendasi'];
      
      for (let i = 0; i < tabs.length; i++) {
        setActiveTab(tabs[i]);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (i > 0) pdf.addPage();
        
        // Header
        pdf.setFontSize(12);
        pdf.setTextColor(100);
        pdf.text(`Laporan Nutrisi Bulanan - Halaman ${i + 1}/4`, 10, 10);
        
        pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, Math.min(imgHeight, pdfHeight - 25));
        
        // Footer
        pdf.setFontSize(8);
        pdf.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 10, pdfHeight - 5);
      }

      pdf.save(`laporan-nutrisi-bulanan-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Laporan berhasil diunduh!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor laporan');
    } finally {
      setIsExporting(false);
      setActiveTab('ringkasan');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Laporan Bulanan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Nutrisi Bulanan
          </DialogTitle>
          <DialogDescription>{dateRange}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ringkasan" className="gap-1">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Ringkasan</span>
            </TabsTrigger>
            <TabsTrigger value="grafik" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Grafik</span>
            </TabsTrigger>
            <TabsTrigger value="pola" className="gap-1">
              <PieChart className="h-3 w-3" />
              <span className="hidden sm:inline">Pola Makan</span>
            </TabsTrigger>
            <TabsTrigger value="rekomendasi" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              <span className="hidden sm:inline">Rekomendasi</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <div ref={reportRef} className="p-4 bg-background">
              {/* Tab: Ringkasan */}
              <TabsContent value="ringkasan" className="mt-0 space-y-4">
                {/* Overall Score */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Skor Keseluruhan</p>
                        <p className="text-4xl font-bold text-primary">{overallScore}</p>
                        <p className="text-xs text-muted-foreground">dari 100</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={overallScore >= 70 ? 'default' : overallScore >= 40 ? 'secondary' : 'destructive'}>
                          {overallScore >= 70 ? 'Sangat Baik' : overallScore >= 40 ? 'Cukup Baik' : 'Perlu Perbaikan'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={overallScore} className="mt-3 h-2" />
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Rata-rata Kalori</span>
                      </div>
                      <p className="text-xl font-bold">{averages.kalori}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {targetKalori} ({Math.round((averages.kalori / targetKalori) * 100)}%)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Drumstick className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-muted-foreground">Rata-rata Protein</span>
                      </div>
                      <p className="text-xl font-bold">{averages.protein}g</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {targetProtein}g ({Math.round((averages.protein / targetProtein) * 100)}%)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Hari Dicatat</span>
                      </div>
                      <p className="text-xl font-bold">{pattern.daysLogged}/{pattern.totalDays}</p>
                      <p className="text-xs text-muted-foreground">
                        Konsistensi: {Math.round(pattern.loggingRate)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Target Tercapai</span>
                      </div>
                      <p className="text-xl font-bold">{pattern.daysOnCalorieTarget} hari</p>
                      <p className="text-xs text-muted-foreground">
                        {pattern.daysLogged > 0 ? Math.round((pattern.daysOnCalorieTarget / pattern.daysLogged) * 100) : 0}% dari hari tercatat
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievement Summary */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Pencapaian</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{unlockedWaterAchievements.length}</p>
                        <p className="text-xs text-muted-foreground">Air</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{unlockedWeightAchievements.length}</p>
                        <p className="text-xs text-muted-foreground">Berat</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{waterStats.streak}</p>
                        <p className="text-xs text-muted-foreground">Streak Air</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Grafik */}
              <TabsContent value="grafik" className="mt-0 space-y-4">
                {/* Daily Calories Chart */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Trend Kalori Harian</span>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <ReferenceLine 
                            y={targetKalori} 
                            stroke="hsl(var(--destructive))" 
                            strokeDasharray="5 5"
                            label={{ value: 'Target', fontSize: 10 }}
                          />
                          <Bar dataKey="kalori" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Comparison */}
                {pattern.weeklyAverages.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Perbandingan Mingguan</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={pattern.weeklyAverages}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="week" tickFormatter={(w) => `Minggu ${w}`} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="avgKalori" stroke="hsl(var(--primary))" name="Kalori" />
                            <Line type="monotone" dataKey="avgProtein" stroke="hsl(var(--chart-2))" name="Protein" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weight Progress */}
                {weightChartData.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Progress Berat Badan</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weightChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            {targetWeight && (
                              <ReferenceLine 
                                y={targetWeight} 
                                stroke="hsl(var(--chart-2))" 
                                strokeDasharray="5 5"
                                label={{ value: 'Target', fontSize: 10 }}
                              />
                            )}
                            <Line type="monotone" dataKey="berat" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Pola Makan */}
              <TabsContent value="pola" className="mt-0 space-y-4">
                {/* Macro Distribution */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PieChart className="h-4 w-4 text-primary" />
                      <span className="font-medium">Distribusi Makro</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-32 w-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={macroChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={50}
                            >
                              {macroChartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => `${Math.round(v)}%`} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {macroChartData.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            <span className="text-sm">{item.name}</span>
                            <span className="text-sm font-medium ml-auto">{Math.round(item.value)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Timing */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Konsistensi Waktu Makan</span>
                    </div>
                    <div className="space-y-3">
                      {mealTimeData.map(item => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">{Math.round(item.rate)}%</span>
                          </div>
                          <Progress value={item.rate} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Foods */}
                {pattern.topFoods.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Utensils className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Makanan Favorit</span>
                      </div>
                      <div className="space-y-2">
                        {pattern.topFoods.map((food, i) => (
                          <div key={food.name} className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                              {i + 1}
                            </Badge>
                            <span className="text-sm flex-1 truncate">{food.name}</span>
                            <span className="text-xs text-muted-foreground">{food.count}x</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trends */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Trend Bulan Ini</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Kalori</p>
                        <Badge variant={pattern.caloriesTrend === 'stable' ? 'secondary' : pattern.caloriesTrend === 'decreasing' ? 'default' : 'destructive'}>
                          {pattern.caloriesTrend === 'increasing' ? '📈 Naik' : pattern.caloriesTrend === 'decreasing' ? '📉 Turun' : '➡️ Stabil'}
                        </Badge>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Protein</p>
                        <Badge variant={pattern.proteinTrend === 'increasing' ? 'default' : pattern.proteinTrend === 'decreasing' ? 'destructive' : 'secondary'}>
                          {pattern.proteinTrend === 'increasing' ? '📈 Naik' : pattern.proteinTrend === 'decreasing' ? '📉 Turun' : '➡️ Stabil'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Rekomendasi */}
              <TabsContent value="rekomendasi" className="mt-0 space-y-4">
                {/* Achievement Badges */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Pencapaian Terbuka</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                        <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{unlockedWaterAchievements.length}</p>
                        <p className="text-xs text-muted-foreground">Achievement Air</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <Scale className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{unlockedWeightAchievements.length}</p>
                        <p className="text-xs text-muted-foreground">Achievement Berat</p>
                      </div>
                    </div>
                    {weightProgress !== null && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress ke Target Berat</span>
                          <span className="font-medium">{Math.round(weightProgress)}%</span>
                        </div>
                        <Progress value={weightProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Rekomendasi Personal</span>
                    </div>
                    {recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                          <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Belum cukup data untuk membuat rekomendasi. Catat makanan minimal 7 hari.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Water Stats */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Statistik Air Mingguan</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-blue-500">{waterStats.streak}</p>
                        <p className="text-xs text-muted-foreground">Streak</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{waterStats.avgGlasses}</p>
                        <p className="text-xs text-muted-foreground">Rata-rata/hari</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-500">{waterStats.daysCompleted}/7</p>
                        <p className="text-xs text-muted-foreground">Target Tercapai</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={exportAsPDF} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Unduh PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
