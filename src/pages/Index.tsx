import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { InputSection } from "@/components/InputSection";
import { PreferencesSection } from "@/components/PreferencesSection";
import { RecipeCards } from "@/components/RecipeCards";
import { SettingsDialog } from "@/components/SettingsDialog";
import { HistoryDialog } from "@/components/HistoryDialog";
import { FavoritesDialog } from "@/components/FavoritesDialog";
import { MainTabNavigation, MainTab } from "@/components/MainTabNavigation";
import {
  ChartSkeleton,
  HeatmapSkeleton,
  WeightChartSkeleton,
  NutritionOverviewSkeleton,
  WaterTrackerSkeleton,
} from "@/components/ChartSkeleton";
import { ChartErrorBoundary } from "@/components/ChartErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load tab content and heavy chart components
const MealPlanView = lazy(() => import("@/components/MealPlanView").then(m => ({ default: m.MealPlanView })));
const DailyNutritionTracker = lazy(() => import("@/components/DailyNutritionTracker").then(m => ({ default: m.DailyNutritionTracker })));
const WeeklyNutritionReport = lazy(() => import("@/components/WeeklyNutritionReport").then(m => ({ default: m.WeeklyNutritionReport })));
const MonthlyNutritionReport = lazy(() => import("@/components/MonthlyNutritionReport").then(m => ({ default: m.MonthlyNutritionReport })));
const WeeklyNutritionChart = lazy(() => import("@/components/WeeklyNutritionChart").then(m => ({ default: m.WeeklyNutritionChart })));
const WeightProgressChart = lazy(() => import("@/components/WeightProgressChart").then(m => ({ default: m.WeightProgressChart })));
const WaterTracker = lazy(() => import("@/components/WaterTracker").then(m => ({ default: m.WaterTracker })));
const NutritionOverview = lazy(() => import("@/components/NutritionOverview").then(m => ({ default: m.NutritionOverview })));
const CalorieHeatmap = lazy(() => import("@/components/CalorieHeatmap").then(m => ({ default: m.CalorieHeatmap })));

import { useWaterTracking } from "@/hooks/useWaterTracking";
import { useWeightTracking } from "@/hooks/useWeightTracking";
import { calculateDailyWaterIntake } from "@/types/profile";
import { generateRecipes } from "@/lib/openrouter";
import { RecipeResponse, Preferences, Recipe } from "@/types/recipe";
import { useRecipeHistory } from "@/hooks/useRecipeHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("ide-resep");
  const [isLoading, setIsLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeResponse | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: [],
    cuisine: [],
    difficulty: "",
    time: "cepat",
  });
  const [isAutoMode, setIsAutoMode] = useState(() => {
    const saved = localStorage.getItem("preferences_auto_mode");
    return saved !== null ? saved === "true" : true;
  });
  const [inputData, setInputData] = useState<{ images: string[]; text: string }>({
    images: [],
    text: "",
  });

  const { history, saveToHistory, removeFromHistory, clearHistory } = useRecipeHistory();
  const { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites } = useFavorites();
  const { profile } = useUserProfile();
  const { dailyData, weeklyData: weeklyNutritionData, addEntry, removeEntry, clearToday } = useDailyNutrition();
  
  // Water tracking for overview stats
  const waterTarget = profile.beratBadan 
    ? calculateDailyWaterIntake(profile.beratBadan, profile.levelAktivitas).glasses
    : 8;
  const { stats: waterStats, unlockedAchievements: unlockedWaterAchievements } = useWaterTracking(waterTarget);
  
  // Weight tracking for monthly report
  const { entries: weightEntries } = useWeightTracking();
  const unlockedWeightAchievements: string[] = JSON.parse(localStorage.getItem('weight_achievements') || '[]');

  const handleLogNutrition = useCallback((recipe: Recipe) => {
    if (!recipe.nutrisi) {
      toast.error("Resep ini tidak memiliki info nutrisi");
      return;
    }
    
    const now = new Date();
    const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    addEntry({
      nama: recipe.nama,
      kalori: recipe.nutrisi.kalori,
      protein: recipe.nutrisi.protein,
      karbohidrat: recipe.nutrisi.karbohidrat,
      lemak: recipe.nutrisi.lemak,
      waktu,
    });
    
    toast.success(`${recipe.nama} dicatat ke nutrisi harian`);
  }, [addEntry]);

  // Save auto mode preference
  useEffect(() => {
    localStorage.setItem("preferences_auto_mode", String(isAutoMode));
  }, [isAutoMode]);

  useEffect(() => {
    // Use sessionStorage for better security (clears when tab closes)
    const savedKey = sessionStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleInputChange = useCallback((data: { images: string[]; text: string }) => {
    setInputData(data);
  }, []);

  // Check if user has provided any input
  const hasInput = inputData.images.length > 0 || inputData.text.trim().length > 0;

  const handleSubmit = async () => {
    if (!apiKey) {
      toast.error("Masukkan API Key di Pengaturan terlebih dahulu");
      setSettingsOpen(true);
      return;
    }

    if (!hasInput) {
      toast.error("Masukkan bahan atau foto terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setRecipeData(null);

    try {
      // Use empty preferences for Auto mode, otherwise use user preferences
      const finalPreferences: Preferences = isAutoMode
        ? { dietary: [], cuisine: [], difficulty: "", time: "" }
        : preferences;

      const submitData: { text?: string; images?: string[] } = {};
      if (inputData.images.length > 0) {
        submitData.images = inputData.images;
      }
      if (inputData.text.trim()) {
        submitData.text = inputData.text.trim();
      }

      const result = await generateRecipes(submitData, apiKey, finalPreferences, isAutoMode, profile);
      setRecipeData(result);
      saveToHistory(result, inputData.text);
      toast.success(`${result.recipes?.length || 0} resep ditemukan`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (data: RecipeResponse) => {
    setRecipeData(data);
    toast.success("Resep dari riwayat ditampilkan");
  };

  const handleSelectFavorite = (recipe: Recipe) => {
    setRecipeData({ recipes: [recipe] });
    toast.success("Resep favorit ditampilkan");
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    if (isFavorite(recipe.nama)) {
      const fav = favorites.find((f) => f.recipe.nama === recipe.nama);
      if (fav) {
        removeFavorite(fav.id);
        toast.success("Dihapus dari favorit");
      }
    } else {
      addFavorite(recipe);
      toast.success("Ditambahkan ke favorit");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSettingsClick={() => setSettingsOpen(true)} 
        onFavoritesClick={() => setFavoritesOpen(true)}
      />

      <MainTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "ide-resep" && (
        <main className="container max-w-2xl mx-auto px-4 py-4 space-y-4 animate-in fade-in duration-300">
          <InputSection onInputChange={handleInputChange} isLoading={isLoading} />

          <PreferencesSection
            preferences={preferences}
            onPreferencesChange={setPreferences}
            isAutoMode={isAutoMode}
            onAutoModeChange={setIsAutoMode}
          />

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!hasInput || isLoading}
              className="w-full h-14 text-base font-medium rounded-full shadow-soft-md hover:shadow-soft-lg transition-shadow"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Mencari resep...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Cari Resep
                </>
              )}
            </Button>
            {!hasInput && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Masukkan bahan terlebih dahulu (foto atau teks)
              </p>
            )}
          </div>

          <RecipeCards 
            data={recipeData} 
            isLoading={isLoading}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            apiKey={apiKey}
            onLogNutrition={handleLogNutrition}
          />
        </main>
      )}

      {activeTab === "meal-planning" && (
        <main className="container max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
          <MealPlanView apiKey={apiKey} onSettingsClick={() => setSettingsOpen(true)} />
        </main>
      )}

      {activeTab === "nutrisi" && (
        <main className="container max-w-2xl mx-auto px-4 py-4 space-y-4 animate-in fade-in duration-300">
          {/* Overview Summary */}
          <ChartErrorBoundary fallbackTitle="Gagal memuat ringkasan nutrisi">
            <Suspense fallback={<NutritionOverviewSkeleton />}>
              <NutritionOverview
                weeklyNutrition={weeklyNutritionData}
                targetKalori={profile.targetKalori || 2000}
                waterStats={waterStats}
                waterTarget={waterTarget}
              />
            </Suspense>
          </ChartErrorBoundary>

          {/* Daily Nutrition Tracker */}
          <DailyNutritionTracker
            entries={dailyData.entries}
            totalKalori={dailyData.totalKalori}
            totalProtein={dailyData.totalProtein}
            totalKarbohidrat={dailyData.totalKarbohidrat}
            totalLemak={dailyData.totalLemak}
            targetKalori={profile.targetKalori || 2000}
            targetProtein={profile.targetProtein || 50}
            targetKarbohidrat={profile.targetKarbohidrat || 250}
            targetLemak={profile.targetLemak || 65}
            onRemoveEntry={removeEntry}
            onClearAll={clearToday}
            onAddEntry={addEntry}
          />

          {/* Weekly & Monthly Reports */}
          <div className="flex justify-end gap-2 flex-wrap">
            <WeeklyNutritionReport
              weeklyData={weeklyNutritionData}
              targetKalori={profile.targetKalori || 2000}
              targetProtein={profile.targetProtein}
              targetKarbohidrat={profile.targetKarbohidrat}
              targetLemak={profile.targetLemak}
              waterStats={waterStats}
              waterTarget={waterTarget}
            />
            <MonthlyNutritionReport
              monthlyData={weeklyNutritionData}
              targetKalori={profile.targetKalori || 2000}
              targetProtein={profile.targetProtein}
              targetKarbohidrat={profile.targetKarbohidrat}
              targetLemak={profile.targetLemak}
              weightEntries={weightEntries}
              targetWeight={profile.targetBeratBadan}
              waterStats={waterStats}
              waterTarget={waterTarget}
              unlockedWaterAchievements={unlockedWaterAchievements}
              unlockedWeightAchievements={unlockedWeightAchievements}
            />
          </div>

          <ChartErrorBoundary fallbackTitle="Gagal memuat grafik mingguan">
            <Suspense fallback={<ChartSkeleton showStats showToggle />}>
              <WeeklyNutritionChart
                weeklyData={weeklyNutritionData}
                targetKalori={profile.targetKalori || 2000}
                targetProtein={profile.targetProtein}
                targetKarbohidrat={profile.targetKarbohidrat}
                targetLemak={profile.targetLemak}
              />
            </Suspense>
          </ChartErrorBoundary>

          {/* Calorie Heatmap */}
          <ChartErrorBoundary fallbackTitle="Gagal memuat heatmap kalori">
            <Suspense fallback={<HeatmapSkeleton />}>
              <CalorieHeatmap
                nutritionData={weeklyNutritionData}
                targetKalori={profile.targetKalori || 2000}
              />
            </Suspense>
          </ChartErrorBoundary>

          {/* Weight Progress Chart */}
          <ChartErrorBoundary fallbackTitle="Gagal memuat grafik berat badan">
            <Suspense fallback={<WeightChartSkeleton />}>
              <WeightProgressChart targetWeight={profile.targetBeratBadan} />
            </Suspense>
          </ChartErrorBoundary>

          {/* Water Tracker */}
          <ChartErrorBoundary fallbackTitle="Gagal memuat pelacak air">
            <Suspense fallback={<WaterTrackerSkeleton />}>
              <WaterTracker 
                beratBadan={profile.beratBadan} 
                levelAktivitas={profile.levelAktivitas} 
              />
            </Suspense>
          </ChartErrorBoundary>
        </main>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-muted-foreground/60">
        <p>
          made by{" "}
          <a 
            href="https://alfindigital.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium hover:underline hover:text-muted-foreground transition-colors"
          >
            alfindigital
          </a>
        </p>
      </footer>

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onApiKeyChange={handleApiKeyChange}
        onHistoryClick={() => { setSettingsOpen(false); setHistoryOpen(true); }}
      />

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onSelect={handleSelectHistory}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <FavoritesDialog
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        favorites={favorites}
        onSelect={handleSelectFavorite}
        onRemove={removeFavorite}
        onClear={clearFavorites}
      />
    </div>
  );
};

export default Index;
