import { memo } from "react";
import { MealSlot } from "@/types/mealPlan";
import { Lock, LockOpen, SkipForward, Plus, ChevronRight, GripVertical, ArrowLeftRight, Copy, ClipboardPaste, Trash2 } from "lucide-react";
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
  isCopySource?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrag?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onRemove?: () => void;
}

export const MealPlanCell = memo(({
  slot,
  onToggleLock,
  onToggleSkip,
  onViewDetail,
  compact = false,
  isDragging = false,
  isDragOver = false,
  isCopySource = false,
  onDragStart,
  onDragEnd,
  onDrag,
  onDragOver,
  onDragLeave,
  onDrop,
  onCopy,
  onPaste,
  onRemove,
}: MealPlanCellProps) => {
  const hasRecipe = slot.recipe && !slot.isSkipped;
  const canDrag = hasRecipe || slot.isSkipped;

  // Common transition classes for smooth animations
  const baseTransition = "transition-all duration-300 ease-out";
  const dragTransition = "transform-gpu";

  if (slot.isSkipped) {
    return (
      <div 
        className={cn(
          "relative rounded-lg border-0 shadow-sm bg-muted/30 flex items-center justify-center",
          baseTransition,
          dragTransition,
          compact ? "h-14" : "h-24 md:h-28",
          isDragging && "opacity-40 scale-90 rotate-2 shadow-lg",
          isDragOver && "bg-muted/50 scale-105 shadow-md"
        )}
        draggable={canDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrag={onDrag}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drop indicator overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-lg animate-fade-in">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground animate-pulse" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground text-xs gap-1",
            isDragOver && "opacity-30"
          )}
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
          "relative rounded-lg border-0 shadow-sm bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-1 cursor-pointer group",
          baseTransition,
          dragTransition,
          compact ? "h-14" : "h-24 md:h-28",
          isDragOver && "bg-muted/50 scale-105 shadow-md",
          isCopySource && "bg-muted/30"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drop indicator overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg animate-fade-in">
            <div className="flex flex-col items-center gap-1">
              <ArrowLeftRight className="h-6 w-6 text-muted-foreground animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Lepas di sini</span>
            </div>
          </div>
        )}
        
        {/* Paste indicator when copy mode active */}
        {isCopySource && !isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onPaste?.();
              }}
            >
              <ClipboardPaste className="h-4 w-4" />
              Tempel di sini
            </Button>
          </div>
        )}
        
        <Plus className={cn(
          "h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200",
          (isDragOver || isCopySource) && "opacity-0"
        )} />
        <span className={cn(
          "text-xs text-muted-foreground",
          (isDragOver || isCopySource) && "opacity-0"
        )}>Kosong</span>
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
        "relative rounded-lg border-0 shadow-sm bg-card hover:bg-accent/50 cursor-pointer group overflow-hidden",
        baseTransition,
        dragTransition,
        slot.isLocked && "ring-1 ring-muted-foreground/20",
        compact ? "h-14" : "h-24 md:h-28",
        isDragging && "opacity-40 scale-90 rotate-1 shadow-xl z-50",
        isDragOver && "bg-muted/50 scale-105 shadow-lg",
        isCopySource && "bg-muted/30"
      )}
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={onDrag}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onViewDetail}
    >
      {/* Drop indicator overlay */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10 animate-fade-in">
          <div className="flex flex-col items-center gap-1">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Tukar</span>
          </div>
        </div>
      )}

      {/* Paste indicator when copy mode active */}
      {isCopySource && !isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onPaste?.();
            }}
          >
            <ClipboardPaste className="h-4 w-4" />
            Tempel (Timpa)
          </Button>
        </div>
      )}

      {/* Drag handle indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gradient-to-r from-muted/50 to-transparent cursor-grab active:cursor-grabbing z-20",
        "transition-opacity duration-200",
        isDragging && "opacity-100"
      )}>
        <GripVertical className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          "group-hover:scale-110"
        )} />
      </div>

      {/* Recipe content */}
      <div className={cn(
        "p-2 pl-6 h-full flex flex-col",
        compact ? "gap-0" : "gap-1",
        isDragOver && "opacity-30"
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
        {/* Cost badge */}
        {slot.recipe?.estimasiBiaya && (
          <div className="mt-auto">
            <span className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
              slot.recipe.estimasiBiaya <= 25000 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : slot.recipe.estimasiBiaya <= 50000 
                  ? "bg-accent/10 text-accent" 
                  : "bg-destructive/10 text-destructive"
            )}>
              ~Rp {Math.round(slot.recipe.estimasiBiaya / 1000)}k
            </span>
          </div>
        )}
      </div>

      {/* Actions overlay */}
      <div className={cn(
        "absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        (isDragOver || isCopySource) && "opacity-0"
      )}>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 transition-transform duration-150 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onCopy?.();
          }}
          title="Copy resep"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 transition-transform duration-150 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={slot.isLocked ? "Buka kunci" : "Kunci resep"}
        >
          {slot.isLocked ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <LockOpen className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 transition-transform duration-150 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          title="Hapus resep"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Lock indicator */}
      {slot.isLocked && (
        <div className={cn(
          "absolute bottom-1 left-1 transition-opacity duration-200",
          (isDragOver || isCopySource) && "opacity-30"
        )}>
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* View detail indicator */}
      <ChevronRight className={cn(
        "absolute right-1 bottom-1 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200",
        (isDragOver || isCopySource) && "opacity-0"
      )} />
    </div>
  );
});

MealPlanCell.displayName = "MealPlanCell";
