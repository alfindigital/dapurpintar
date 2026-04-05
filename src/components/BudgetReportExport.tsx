import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Download, FileImage, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BudgetEntry, BudgetSettings, KategoriBiaya, BUDGET_CATEGORIES } from "@/types/mealPlan";
import { toast } from "sonner";

interface BudgetReportExportProps {
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

export const BudgetReportExport = ({
  budgetHistory,
  categoryBreakdown,
  settings,
  monthlyTotal,
}: BudgetReportExportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const chartData = BUDGET_CATEGORIES
    .map(cat => ({
      name: cat.label,
      value: categoryBreakdown[cat.key],
      color: cat.color,
    }))
    .filter(item => item.value > 0);

  const total = Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);
  const remaining = settings.budgetBulanan ? settings.budgetBulanan - monthlyTotal : null;
  const percentage = settings.budgetBulanan 
    ? Math.round((monthlyTotal / settings.budgetBulanan) * 100) 
    : 0;

  const currentMonth = new Date().toLocaleDateString("id-ID", { 
    month: "long", 
    year: "numeric" 
  });

  const exportToPNG = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `laporan-budget-${currentMonth.replace(" ", "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Laporan berhasil diunduh sebagai gambar");
    } catch {
      toast.error("Gagal mengunduh gambar");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`laporan-budget-${currentMonth.replace(" ", "-")}.pdf`);
      toast.success("Laporan berhasil diunduh sebagai PDF");
    } catch {
      toast.error("Gagal mengunduh PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting} className="w-full">
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Laporan
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToPNG}>
            <FileImage className="h-4 w-4 mr-2" />
            Download PNG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Exportable Report */}
      <div
        ref={reportRef}
        className="bg-white text-gray-900 p-6 rounded-lg space-y-6"
        style={{ minWidth: "400px" }}
      >
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Laporan Budget Bulanan</h2>
          <p className="text-gray-600">{currentMonth}</p>
          <p className="text-sm text-gray-500 mt-1">Dapur Pintar</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-gray-900">{formatRupiah(monthlyTotal)}</p>
          </div>
          {settings.budgetBulanan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Budget Bulanan</p>
              <p className="text-2xl font-bold text-gray-900">{formatRupiah(settings.budgetBulanan)}</p>
            </div>
          )}
        </div>

        {/* Progress */}
        {settings.budgetBulanan && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Penggunaan Budget</span>
              <span className={`font-bold ${percentage > 100 ? "text-red-600" : percentage > 80 ? "text-amber-600" : "text-green-600"}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage > 100 ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {remaining !== null && (
              <p className={`text-sm mt-2 ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                {remaining < 0 ? "Melebihi budget" : "Sisa"}: {formatRupiah(Math.abs(remaining))}
              </p>
            )}
          </div>
        )}

        {/* Category Chart */}
        {total > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Distribusi Kategori Biaya</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              {BUDGET_CATEGORIES.map(cat => {
                const value = categoryBreakdown[cat.key];
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                
                return (
                  <div key={cat.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-700">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{formatRupiah(value)}</span>
                      <span className="text-gray-500 w-10 text-right">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly History */}
        {budgetHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Riwayat Mingguan</h3>
            <div className="space-y-2">
              {budgetHistory.slice(0, 4).map((entry) => {
                const endDate = new Date(entry.weekStart);
                endDate.setDate(endDate.getDate() + 6);

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {formatDate(entry.weekStart)} - {formatDate(endDate.toISOString())}
                    </span>
                    <span className="font-semibold text-gray-900">{formatRupiah(entry.totalEstimasi)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            Laporan dihasilkan pada {new Date().toLocaleDateString("id-ID", { 
              day: "numeric", 
              month: "long", 
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
