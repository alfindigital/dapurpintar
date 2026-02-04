import { MealSlot } from "@/types/mealPlan";
import { GripVertical, SkipForward } from "lucide-react";
import { createPortal } from "react-dom";

interface DragPreviewProps {
  slot: MealSlot | null;
  position: { x: number; y: number };
}

export const DragPreview = ({ slot, position }: DragPreviewProps) => {
  if (!slot) return null;

  const content = (
    <div
      className="fixed pointer-events-none z-[9999] animate-scale-in"
      style={{
        left: position.x + 12,
        top: position.y + 12,
        transform: "rotate(3deg)",
      }}
    >
      <div className="w-40 rounded-lg border-2 border-primary bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 px-2 py-1 flex items-center gap-1.5 border-b border-primary/20">
          <GripVertical className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
            Memindahkan
          </span>
        </div>

        {/* Content */}
        <div className="p-2.5 bg-card">
          {slot.isSkipped ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <SkipForward className="h-4 w-4" />
              <span className="text-sm font-medium">Slot Dilewati</span>
            </div>
          ) : slot.recipe ? (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm text-card-foreground line-clamp-2 leading-tight">
                {slot.recipe.nama}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{slot.recipe.waktu}</span>
                <span>•</span>
                <span>{slot.recipe.masakan || "Indonesia"}</span>
              </div>
              {slot.recipe.estimasiBiaya && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                  ~Rp {Math.round(slot.recipe.estimasiBiaya / 1000)}k
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Slot Kosong</span>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
