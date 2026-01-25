import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MealSlot } from "@/types/mealPlan";
import { Ingredient } from "@/types/recipe";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ShoppingCart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slots: MealSlot[];
}

interface AggregatedItem {
  item: string;
  quantities: string[];
  recipes: string[];
}

export const ShoppingListDialog = ({ open, onOpenChange, slots }: ShoppingListDialogProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Aggregate ingredients from all recipes
  const aggregatedItems = useMemo(() => {
    const itemMap = new Map<string, AggregatedItem>();

    for (const slot of slots) {
      if (!slot.recipe || slot.isSkipped) continue;

      for (const bahan of slot.recipe.bahan) {
        const key = bahan.item.toLowerCase().trim();
        const existing = itemMap.get(key);

        if (existing) {
          if (!existing.quantities.includes(bahan.jumlah)) {
            existing.quantities.push(bahan.jumlah);
          }
          if (!existing.recipes.includes(slot.recipe.nama)) {
            existing.recipes.push(slot.recipe.nama);
          }
        } else {
          itemMap.set(key, {
            item: bahan.item,
            quantities: [bahan.jumlah],
            recipes: [slot.recipe.nama],
          });
        }
      }
    }

    return Array.from(itemMap.values()).sort((a, b) => 
      a.item.localeCompare(b.item, "id")
    );
  }, [slots]);

  const toggleItem = (item: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const copyToClipboard = () => {
    const text = aggregatedItems
      .filter(item => !checkedItems.has(item.item))
      .map(item => `• ${item.item}: ${item.quantities.join(" + ")}`)
      .join("\n");
    
    navigator.clipboard.writeText(text);
    toast.success("Daftar belanja disalin!");
  };

  // Calculate total cost
  const totalCost = useMemo(() => {
    return slots
      .filter(slot => slot.recipe && !slot.isSkipped)
      .reduce((sum, slot) => sum + (slot.recipe?.estimasiBiaya || 0), 0);
  }, [slots]);

  const formatRupiah = (value: number): string => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} jt`;
    }
    if (value >= 1000) {
      return `Rp ${Math.round(value / 1000)}k`;
    }
    return `Rp ${value}`;
  };

  const uncheckedCount = aggregatedItems.length - checkedItems.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Daftar Belanja
          </DialogTitle>
        </DialogHeader>

        {aggregatedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada menu untuk minggu ini</p>
            <p className="text-sm">Generate meal plan terlebih dahulu</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <span>{uncheckedCount} item belum dibeli</span>
                {totalCost > 0 && (
                  <span className="text-primary font-medium">
                    • Est. {formatRupiah(totalCost)}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-1">
                <Copy className="h-3 w-3" />
                Salin
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {aggregatedItems.map((item) => {
                  const isChecked = checkedItems.has(item.item);
                  return (
                    <div
                      key={item.item}
                      className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                        isChecked ? "bg-muted/30" : "hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.item)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                          {item.item}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantities.join(" + ")}
                        </div>
                        <div className="text-xs text-muted-foreground/70 truncate">
                          Untuk: {item.recipes.join(", ")}
                        </div>
                      </div>
                      {isChecked && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
