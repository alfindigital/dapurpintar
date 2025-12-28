import { MealSlot } from "@/types/mealPlan";
import { Lock, LockOpen, SkipForward, Plus, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MealPlanCellProps {
  slot: MealSlot;
  onToggleLock: () => void;
  onToggleSkip: () => void;
  onViewDetail: () => void;
  compact?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const MealPlanCell = ({
  slot,
  onToggleLock,
  onToggleSkip,
  onViewDetail,
  compact = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: MealPlanCellProps) => {
  const hasRecipe = slot.recipe && !slot.isSkipped;
  const canDrag = hasRecipe || slot.isSkipped;

  if (slot.isSkipped) {
    return (
      <div 
        className={cn(
          "relative rounded-lg border-2 border-dashed border-muted bg-muted/30 flex items-center justify-center transition-all",
          compact ? "h-16" : "h-24 md:h-28",
          isDragging && "opacity-50 scale-95",
          isDragOver && "border-primary bg-primary/10"
        )}
        draggable={canDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
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
      <div 
        className={cn(
          "relative rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group",
          compact ? "h-16" : "h-24 md:h-28",
          isDragOver && "border-primary bg-primary/10"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
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
        "relative rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer group overflow-hidden",
        slot.isLocked && "ring-2 ring-primary/50",
        compact ? "h-16" : "h-24 md:h-28",
        isDragging && "opacity-50 scale-95 ring-2 ring-primary",
        isDragOver && "ring-2 ring-primary bg-primary/10"
      )}
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onViewDetail}
    >
      {/* Drag handle indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-muted/50 to-transparent cursor-grab active:cursor-grabbing",
        isDragging && "opacity-100"
      )}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Recipe content */}
      <div className={cn(
        "p-2 pl-6 h-full flex flex-col",
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
