import { MealSlot } from "@/types/mealPlan";
import { Lock, LockOpen, SkipForward, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MealPlanCellProps {
  slot: MealSlot;
  onToggleLock: () => void;
  onToggleSkip: () => void;
  onViewDetail: () => void;
  compact?: boolean;
}

export const MealPlanCell = ({
  slot,
  onToggleLock,
  onToggleSkip,
  onViewDetail,
  compact = false,
}: MealPlanCellProps) => {
  const hasRecipe = slot.recipe && !slot.isSkipped;

  if (slot.isSkipped) {
    return (
      <div className={cn(
        "relative rounded-lg border-2 border-dashed border-muted bg-muted/30 flex items-center justify-center",
        compact ? "h-16" : "h-24 md:h-28"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-xs gap-1"
          onClick={onToggleSkip}
        >
          <SkipForward className="h-3 w-3" />
          Dilewati
        </Button>
      </div>
    );
  }

  if (!hasRecipe) {
    return (
      <div className={cn(
        "relative rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer group",
        compact ? "h-16" : "h-24 md:h-28"
      )}>
        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-xs text-muted-foreground">Kosong</span>
        <div className="absolute top-1 right-1 flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSkip();
            }}
            title="Lewati slot ini"
          >
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group overflow-hidden",
        slot.isLocked && "ring-2 ring-primary/50",
        compact ? "h-16" : "h-24 md:h-28"
      )}
      onClick={onViewDetail}
    >
      {/* Recipe content */}
      <div className={cn(
        "p-2 h-full flex flex-col",
        compact ? "gap-0" : "gap-1"
      )}>
        <h4 className={cn(
          "font-medium text-card-foreground line-clamp-2 leading-tight",
          compact ? "text-xs" : "text-sm"
        )}>
          {slot.recipe?.nama}
        </h4>
        {!compact && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {slot.recipe?.waktu} • {slot.recipe?.masakan || "Indonesia"}
          </p>
        )}
      </div>

      {/* Actions overlay */}
      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={slot.isLocked ? "Buka kunci" : "Kunci resep"}
        >
          {slot.isLocked ? (
            <Lock className="h-3 w-3 text-primary" />
          ) : (
            <LockOpen className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Lock indicator */}
      {slot.isLocked && (
        <div className="absolute bottom-1 left-1">
          <Lock className="h-3 w-3 text-primary" />
        </div>
      )}

      {/* View detail indicator */}
      <ChevronRight className="absolute right-1 bottom-1 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
