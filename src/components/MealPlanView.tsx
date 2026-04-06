import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart, Trash2, Loader2, BookmarkPlus, Undo2, Redo2, Save, Wallet, Play } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBudgetTracking } from "@/hooks/useBudgetTracking";
import { MealPlanGrid } from "./MealPlanGrid";
import { BudgetOverviewCard } from "./BudgetOverviewCard";
import { BudgetAlertBanner } from "./BudgetAlertBanner";
import { ShareMealPlanDropdown } from "./ShareMealPlanDropdown";
import { MealSlot, MealPlanPreferences } from "@/types/mealPlan";
import { generateMealPlan } from "@/lib/mealPlanGenerator";
import { generateMockMealPlan } from "@/lib/mockMealPlanData";
import { toast } from "sonner";

// Lazy load dialogs - only loaded when opened
const MealDetailSheet = lazy(() => import("./MealDetailSheet").then(m => ({ default: m.MealDetailSheet })));
const GeneratePlanDialog = lazy(() => import("./GeneratePlanDialog").then(m => ({ default: m.GeneratePlanDialog })));
const ShoppingListDialog = lazy(() => import("./ShoppingListDialog").then(m => ({ default: m.ShoppingListDialog })));
const TemplatesDialog = lazy(() => import("./TemplatesDialog").then(m => ({ default: m.TemplatesDialog })));
const BudgetSettingsDialog = lazy(() => import("./BudgetSettingsDialog").then(m => ({ default: m.BudgetSettingsDialog })));
const BudgetDetailSheet = lazy(() => import("./BudgetDetailSheet").then(m => ({ default: m.BudgetDetailSheet })));
const ConfettiCelebration = lazy(() => import("./ConfettiCelebration").then(m => ({ default: m.ConfettiCelebration })));

interface MealPlanViewProps {
  apiKey: string;
  onSettingsClick: () => void;
}

export const MealPlanView = ({ apiKey, onSettingsClick }: MealPlanViewProps) => {
  const { 
    mealPlan, 
    templates,
    isLoading, 
    setIsLoading, 
    lastSavedAt,
    toggleLock, 
    toggleSkip, 
    setSlots, 
    clearPlan,
    getExistingRecipeNames,
    saveAsTemplate,
    applyTemplate,
    deleteTemplate,
    renameTemplate,
    swapSlots,
    copyToSlot,
    updateSlot,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useMealPlan();
  const { profile } = useUserProfile();
  const {
    budgetHistory,
    settings: budgetSettings,
    updateSettings: updateBudgetSettings,
    calculateWeeklyBudget,
    saveWeeklyBudget,
    getCurrentWeekBudget,
    monthlyTotal,
    alertStatus,
    categoryBreakdown,
  } = useBudgetTracking();

  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [budgetSettingsOpen, setBudgetSettingsOpen] = useState(false);
  const [budgetDetailOpen, setBudgetDetailOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Track if celebration has been shown for current complete state
  const celebrationShownRef = useRef(false);
  const prevCompletionRef = useRef(false);

  // Check if meal plan is complete (all slots filled or intentionally skipped)
  const isMealPlanComplete = useMemo(() => {
    if (!mealPlan) return false;
    return mealPlan.slots.every(slot => slot.recipe !== null || slot.isSkipped);
  }, [mealPlan?.slots]);

  // Trigger celebration when meal plan becomes complete
  useEffect(() => {
    if (isMealPlanComplete && !prevCompletionRef.current && !celebrationShownRef.current) {
      // Meal plan just became complete
      setShowCelebration(true);
      celebrationShownRef.current = true;
    }
    
    // Reset celebration flag when plan becomes incomplete
    if (!isMealPlanComplete && prevCompletionRef.current) {
      celebrationShownRef.current = false;
    }
    
    prevCompletionRef.current = isMealPlanComplete;
  }, [isMealPlanComplete]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) {
            redo();
            toast.success("Redo berhasil");
          }
        } else {
          if (canUndo) {
            undo();
            toast.success("Undo berhasil");
          }
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.success("Redo berhasil");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const handleUndo = () => {
    if (undo()) {
      toast.success("Undo berhasil");
    }
  };

  const handleRedo = () => {
    if (redo()) {
      toast.success("Redo berhasil");
    }
  };

  const handleViewDetail = (slot: MealSlot) => {
    if (slot.recipe) {
      setSelectedSlot(slot);
      setDetailOpen(true);
    }
  };

  const handleGenerate = async (preferences: MealPlanPreferences) => {
    if (!apiKey) {
      toast.error("Masukkan API Key di Pengaturan terlebih dahulu");
      onSettingsClick();
      return;
    }

    if (!mealPlan) return;

    setIsLoading(true);
    try {
      const newSlots = await generateMealPlan({
        slots: mealPlan.slots,
        preferences,
        userProfile: profile,
        apiKey,
        existingRecipeNames: getExistingRecipeNames(),
      });
      setSlots(newSlots);
      setGenerateOpen(false);
      
      const filledCount = newSlots.filter(s => s.recipe && !s.isSkipped).length;
      toast.success(`${filledCount} menu berhasil digenerate!`);

      // Update budget tracking
      if (mealPlan) {
        const budgetEntry = calculateWeeklyBudget(newSlots, mealPlan.weekStart);
        saveWeeklyBudget(budgetEntry);
      }
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal generate meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    if (!mealPlan) return;
    const mockSlots = generateMockMealPlan(mealPlan.slots);
    setSlots(mockSlots);
    const budgetEntry = calculateWeeklyBudget(mockSlots, mealPlan.weekStart);
    saveWeeklyBudget(budgetEntry);
    toast.success("Demo meal plan berhasil dimuat! 🎉");
  };

  const handleClear = () => {
    clearPlan();
    toast.success("Meal plan direset (yang dikunci tetap ada)");
  };

  // Get current and previous week budget
  const currentWeekBudget = mealPlan ? getCurrentWeekBudget(mealPlan.weekStart) : null;
  const previousWeekBudget = budgetHistory.length > 1 ? budgetHistory[1] : null;

  // Recalculate budget when slots change
  useEffect(() => {
    if (mealPlan && mealPlan.slots.some(s => s.recipe && !s.isSkipped)) {
      const budgetEntry = calculateWeeklyBudget(mealPlan.slots, mealPlan.weekStart);
      saveWeeklyBudget(budgetEntry);
    }
  }, [mealPlan?.slots]);

  const hasLockedSlots = mealPlan?.slots.some(s => s.isLocked) || false;
  const hasAnyRecipes = mealPlan?.slots.some(s => s.recipe && !s.isSkipped) || false;

  const formattedLastSaved = useMemo(() => {
    if (!lastSavedAt) return null;
    const date = new Date(lastSavedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 10) return "Baru saja";
    if (diffSec < 60) return `${diffSec} detik lalu`;
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    
    return date.toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "short", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  }, [lastSavedAt]);

  const getWeekRange = () => {
    if (!mealPlan) return "";
    const start = new Date(mealPlan.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (!mealPlan) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Budget Alert Banner */}
      {budgetSettings.budgetBulanan && (alertStatus.isWarning || alertStatus.isOver) && (
        <BudgetAlertBanner
          alertStatus={alertStatus}
          monthlyTotal={monthlyTotal}
          budgetBulanan={budgetSettings.budgetBulanan}
          onSettingsClick={() => setBudgetSettingsOpen(true)}
        />
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold truncate">Meal Plan Minggu Ini</h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>{getWeekRange()}</span>
              {formattedLastSaved && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1">
                    <Save className="h-3 w-3" />
                    {formattedLastSaved}
                  </span>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={() => setGenerateOpen(true)}
            disabled={isLoading}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Generate</span>
          </Button>
        </div>
        
        {/* Action buttons row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={!canUndo} className="h-8 px-2 rounded-r-none border-r" title="Undo">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={!canRedo} className="h-8 px-2 rounded-l-none" title="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setTemplatesOpen(true)} className="h-8 gap-1 px-2.5">
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Template</span>
          </Button>
          {hasAnyRecipes && (
            <>
              <ShareMealPlanDropdown slots={mealPlan.slots} weekRange={getWeekRange()} />
              <Button variant="outline" size="sm" onClick={() => setShoppingOpen(true)} className="h-8 gap-1 px-2.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Belanja</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} className="h-8 gap-1 px-2.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Reset</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Budget Overview Card */}
      <BudgetOverviewCard
        currentWeekBudget={currentWeekBudget}
        monthlyTotal={monthlyTotal}
        settings={budgetSettings}
        alertStatus={alertStatus}
        onSettingsClick={() => setBudgetSettingsOpen(true)}
        onDetailClick={() => setBudgetDetailOpen(true)}
        previousWeekBudget={previousWeekBudget}
      />

      {/* Info banner for empty state */}
      {!hasAnyRecipes && (
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/60" />
          <p className="font-medium">Belum ada menu</p>
          <p className="text-sm text-muted-foreground mb-3">
            Tap "Generate" atau coba Demo
          </p>
          <Button variant="outline" size="sm" onClick={handleLoadDemo} className="gap-1.5">
            <Play className="h-4 w-4" />
            Coba Demo
          </Button>
        </div>
      )}

      {/* Grid */}
      <MealPlanGrid
        mealPlan={mealPlan}
        onToggleLock={toggleLock}
        onToggleSkip={toggleSkip}
        onViewDetail={handleViewDetail}
        onSwapSlots={swapSlots}
        onCopyToSlot={copyToSlot}
        onRemoveRecipe={(slotId) => updateSlot(slotId, null)}
      />

      {/* Lazy-loaded dialogs - only mount when opened */}
      <Suspense fallback={null}>
        {detailOpen && (
          <MealDetailSheet
            slot={selectedSlot}
            open={detailOpen}
            onOpenChange={setDetailOpen}
          />
        )}

        {generateOpen && (
          <GeneratePlanDialog
            open={generateOpen}
            onOpenChange={setGenerateOpen}
            onGenerate={handleGenerate}
            isGenerating={isLoading}
            hasLockedSlots={hasLockedSlots}
          />
        )}

        {shoppingOpen && (
          <ShoppingListDialog
            open={shoppingOpen}
            onOpenChange={setShoppingOpen}
            slots={mealPlan.slots}
          />
        )}

        {templatesOpen && (
          <TemplatesDialog
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            templates={templates}
            onSaveTemplate={saveAsTemplate}
            onApplyTemplate={applyTemplate}
            onDeleteTemplate={deleteTemplate}
            onRenameTemplate={renameTemplate}
            hasCurrentPlan={hasAnyRecipes}
          />
        )}

        {budgetSettingsOpen && (
          <BudgetSettingsDialog
            open={budgetSettingsOpen}
            onOpenChange={setBudgetSettingsOpen}
            settings={budgetSettings}
            onSave={updateBudgetSettings}
          />
        )}

        {budgetDetailOpen && (
          <BudgetDetailSheet
            open={budgetDetailOpen}
            onOpenChange={setBudgetDetailOpen}
            budgetHistory={budgetHistory}
            categoryBreakdown={categoryBreakdown}
            settings={budgetSettings}
            monthlyTotal={monthlyTotal}
          />
        )}

        {showCelebration && (
          <ConfettiCelebration
            isActive={showCelebration}
            onComplete={handleCelebrationComplete}
          />
        )}
      </Suspense>
    </div>
  );
};
