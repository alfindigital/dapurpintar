import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MealSlot, DAYS, MEAL_TIMES } from "@/types/mealPlan";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShareRecipeDropdown } from "./ShareRecipeDropdown";
import { Recipe } from "@/types/recipe";

interface MealDetailSheetProps {
  slot: MealSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MealDetailSheet = ({ slot, open, onOpenChange }: MealDetailSheetProps) => {
  if (!slot?.recipe) return null;

  const recipe = slot.recipe;
  const mealTimeLabel = MEAL_TIMES.find(m => m.key === slot.mealTime)?.label || slot.mealTime;
  const dayLabel = DAYS[slot.dayIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{dayLabel}</Badge>
                  <span>•</span>
                  <span>{mealTimeLabel}</span>
                </div>
                <ShareRecipeDropdown recipe={recipe as Recipe} />
              </div>
              <SheetTitle className="text-xl leading-tight">{recipe.nama}</SheetTitle>
              <p className="text-muted-foreground text-sm">{recipe.deskripsi}</p>
            </SheetHeader>

            {/* Quick info */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{recipe.waktu}</span>
              </div>
              {recipe.porsi && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{recipe.porsi}</span>
                </div>
              )}
              {recipe.tingkatKesulitan && (
                <div className="flex items-center gap-1.5 text-sm">
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                  <span>{recipe.tingkatKesulitan}</span>
                </div>
              )}
              {recipe.masakan && (
                <Badge variant="outline">{recipe.masakan}</Badge>
              )}
            </div>

            {/* Nutrition */}
            {recipe.nutrisi && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-3">Informasi Nutrisi</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <div className="text-lg font-semibold">{recipe.nutrisi.kalori}</div>
                      <div className="text-xs text-muted-foreground">kkal</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Beef className="h-4 w-4 mx-auto mb-1 text-red-500" />
                      <div className="text-lg font-semibold">{recipe.nutrisi.protein}g</div>
                      <div className="text-xs text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Wheat className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <div className="text-lg font-semibold">{recipe.nutrisi.karbohidrat}g</div>
                      <div className="text-xs text-muted-foreground">Karbo</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Droplet className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-lg font-semibold">{recipe.nutrisi.lemak}g</div>
                      <div className="text-xs text-muted-foreground">Lemak</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ingredients */}
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Bahan-bahan</h3>
              <ul className="space-y-2">
                {recipe.bahan.map((bahan, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>
                      <span className="font-medium">{bahan.jumlah}</span>{" "}
                      {bahan.item}
                      {bahan.catatan && (
                        <span className="text-muted-foreground"> ({bahan.catatan})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Langkah-langkah</h3>
              <ol className="space-y-3">
                {recipe.langkah.map((langkah, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{langkah}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {recipe.tips && (
              <>
                <Separator />
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-1">💡 Tips</h4>
                  <p className="text-sm text-muted-foreground">{recipe.tips}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
