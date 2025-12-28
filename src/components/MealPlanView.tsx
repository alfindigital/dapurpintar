import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MealPlanGrid } from "./MealPlanGrid";
import { MealDetailSheet } from "./MealDetailSheet";
import { GeneratePlanDialog } from "./GeneratePlanDialog";
import { ShoppingListDialog } from "./ShoppingListDialog";
import { MealSlot, MealPlanPreferences } from "@/types/mealPlan";
import { generateMealPlan } from "@/lib/mealPlanGenerator";
import { toast } from "sonner";

interface MealPlanViewProps {
  apiKey: string;
  onSettingsClick: () => void;
}

export const MealPlanView = ({ apiKey, onSettingsClick }: MealPlanViewProps) => {
  const { 
    mealPlan, 
    isLoading, 
    setIsLoading, 
    toggleLock, 
    toggleSkip, 
    setSlots, 
    clearPlan,
    getExistingRecipeNames,
  } = useMealPlan();
  const { profile } = useUserProfile();

  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);

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
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal generate meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearPlan();
    toast.success("Meal plan dikosongkan (menu yang dikunci tetap ada)");
  };

  const hasLockedSlots = mealPlan?.slots.some(s => s.isLocked) || false;
  const hasAnyRecipes = mealPlan?.slots.some(s => s.recipe && !s.isSkipped) || false;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Meal Plan Minggu Ini</h2>
          <p className="text-sm text-muted-foreground">{getWeekRange()}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyRecipes && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShoppingOpen(true)}
                className="gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Belanja</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </>
          )}
          <Button
            onClick={() => setGenerateOpen(true)}
            disabled={isLoading}
            size="sm"
            className="gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </div>

      {/* Info banner for empty state */}
      {!hasAnyRecipes && (
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/60" />
          <p className="font-medium">Belum ada meal plan</p>
          <p className="text-sm text-muted-foreground mb-3">
            Klik "Generate" untuk membuat menu mingguan otomatis
          </p>
        </div>
      )}

      {/* Grid */}
      <MealPlanGrid
        mealPlan={mealPlan}
        onToggleLock={toggleLock}
        onToggleSkip={toggleSkip}
        onViewDetail={handleViewDetail}
      />

      {/* Detail Sheet */}
      <MealDetailSheet
        slot={selectedSlot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Generate Dialog */}
      <GeneratePlanDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerate={handleGenerate}
        isGenerating={isLoading}
        hasLockedSlots={hasLockedSlots}
      />

      {/* Shopping List Dialog */}
      <ShoppingListDialog
        open={shoppingOpen}
        onOpenChange={setShoppingOpen}
        slots={mealPlan.slots}
      />
    </div>
  );
};
