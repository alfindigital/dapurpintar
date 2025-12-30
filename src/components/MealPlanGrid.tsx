import { useState, useEffect, useCallback } from "react";
import { WeeklyMealPlan, MealSlot, DAYS, MEAL_TIMES, MealTime } from "@/types/mealPlan";
import { MealPlanCell } from "./MealPlanCell";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface MealPlanGridProps {
  mealPlan: WeeklyMealPlan;
  onToggleLock: (slotId: string) => void;
  onToggleSkip: (slotId: string) => void;
  onViewDetail: (slot: MealSlot) => void;
  onSwapSlots?: (slotId1: string, slotId2: string) => void;
  onCopyToSlot?: (sourceSlotId: string, targetSlotId: string) => void;
  onRemoveRecipe?: (slotId: string) => void;
}

export const MealPlanGrid = ({
  mealPlan,
  onToggleLock,
  onToggleSkip,
  onViewDetail,
  onSwapSlots,
  onCopyToSlot,
  onRemoveRecipe,
}: MealPlanGridProps) => {
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [copySourceSlotId, setCopySourceSlotId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [clipboardSlotId, setClipboardSlotId] = useState<string | null>(null);

  // Get slot by position
  const getSlotByPosition = useCallback((dayIndex: number, mealTimeIndex: number): MealSlot | undefined => {
    const mealTime = MEAL_TIMES[mealTimeIndex]?.key;
    if (!mealTime) return undefined;
    return mealPlan.slots.find(
      slot => slot.dayIndex === dayIndex && slot.mealTime === mealTime
    );
  }, [mealPlan.slots]);

  // Get current slot position
  const getSlotPosition = useCallback((slotId: string): { dayIndex: number; mealTimeIndex: number } | null => {
    const slot = mealPlan.slots.find(s => s.id === slotId);
    if (!slot) return null;
    const mealTimeIndex = MEAL_TIMES.findIndex(m => m.key === slot.mealTime);
    return { dayIndex: slot.dayIndex, mealTimeIndex };
  }, [mealPlan.slots]);

  // Navigate to adjacent slot
  const navigateSlot = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (!selectedSlotId) {
      // Select first slot if none selected
      const firstSlot = getSlotByPosition(0, 0);
      if (firstSlot) setSelectedSlotId(firstSlot.id);
      return;
    }

    const pos = getSlotPosition(selectedSlotId);
    if (!pos) return;

    let newDayIndex = pos.dayIndex;
    let newMealTimeIndex = pos.mealTimeIndex;

    switch (direction) {
      case "left":
        newDayIndex = Math.max(0, pos.dayIndex - 1);
        break;
      case "right":
        newDayIndex = Math.min(DAYS.length - 1, pos.dayIndex + 1);
        break;
      case "up":
        newMealTimeIndex = Math.max(0, pos.mealTimeIndex - 1);
        break;
      case "down":
        newMealTimeIndex = Math.min(MEAL_TIMES.length - 1, pos.mealTimeIndex + 1);
        break;
    }

    const newSlot = getSlotByPosition(newDayIndex, newMealTimeIndex);
    if (newSlot) {
      setSelectedSlotId(newSlot.id);
    }
  }, [selectedSlotId, getSlotPosition, getSlotByPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cancel copy mode with Escape
      if (e.key === "Escape") {
        if (copySourceSlotId) {
          setCopySourceSlotId(null);
          toast.info("Mode copy dibatalkan");
        }
        if (selectedSlotId) {
          setSelectedSlotId(null);
        }
        return;
      }

      // Arrow keys for navigation
      if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateSlot("up");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateSlot("down");
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateSlot("left");
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateSlot("right");
        return;
      }

      // Delete key to remove recipe
      if ((e.key === "Delete" || e.key === "Backspace") && selectedSlotId && onRemoveRecipe) {
        const slot = mealPlan.slots.find(s => s.id === selectedSlotId);
        if (slot?.recipe) {
          const recipeName = slot.recipe.nama;
          onRemoveRecipe(selectedSlotId);
          toast.success(`"${recipeName}" dihapus dari slot`);
          e.preventDefault();
        }
        return;
      }

      // Enter to view detail
      if (e.key === "Enter" && selectedSlotId) {
        const slot = mealPlan.slots.find(s => s.id === selectedSlotId);
        if (slot?.recipe) {
          onViewDetail(slot);
          e.preventDefault();
        }
        return;
      }

      // Ctrl+C to copy selected slot
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedSlotId) {
        const slot = mealPlan.slots.find(s => s.id === selectedSlotId);
        if (slot?.recipe) {
          setClipboardSlotId(selectedSlotId);
          toast.info(`Resep "${slot.recipe.nama}" di-copy (Ctrl+V untuk paste)`);
          e.preventDefault();
        }
        return;
      }

      // Ctrl+V to paste to selected slot
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboardSlotId && selectedSlotId && onCopyToSlot) {
        if (clipboardSlotId !== selectedSlotId) {
          const sourceSlot = mealPlan.slots.find(s => s.id === clipboardSlotId);
          onCopyToSlot(clipboardSlotId, selectedSlotId);
          toast.success(`Resep "${sourceSlot?.recipe?.nama}" berhasil di-paste`);
          e.preventDefault();
        }
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySourceSlotId, selectedSlotId, clipboardSlotId, mealPlan.slots, onCopyToSlot, onRemoveRecipe, onViewDetail, navigateSlot]);

  const getSlot = (dayIndex: number, mealTime: MealTime): MealSlot | undefined => {
    return mealPlan.slots.find(
      slot => slot.dayIndex === dayIndex && slot.mealTime === mealTime
    );
  };

  const handleDragStart = (e: React.DragEvent, slot: MealSlot) => {
    setDraggingSlotId(slot.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", slot.id);
  };

  const handleDragEnd = () => {
    setDraggingSlotId(null);
    setDragOverSlotId(null);
  };

  const handleDragOver = (e: React.DragEvent, slot: MealSlot) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (slot.id !== draggingSlotId) {
      setDragOverSlotId(slot.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: MealSlot) => {
    e.preventDefault();
    const sourceSlotId = e.dataTransfer.getData("text/plain");
    
    if (sourceSlotId && sourceSlotId !== targetSlot.id && onSwapSlots) {
      onSwapSlots(sourceSlotId, targetSlot.id);
      toast.success("Menu berhasil ditukar posisinya");
    }
    
    setDraggingSlotId(null);
    setDragOverSlotId(null);
  };

  const handleCopy = (slot: MealSlot) => {
    if (slot.recipe) {
      setCopySourceSlotId(slot.id);
      toast.info(`Resep "${slot.recipe.nama}" siap di-copy. Klik slot tujuan atau tekan ESC untuk batal.`);
    }
  };

  const handlePaste = (targetSlot: MealSlot) => {
    if (copySourceSlotId && copySourceSlotId !== targetSlot.id && onCopyToSlot) {
      const sourceSlot = mealPlan.slots.find(s => s.id === copySourceSlotId);
      onCopyToSlot(copySourceSlotId, targetSlot.id);
      toast.success(`Resep "${sourceSlot?.recipe?.nama}" berhasil di-copy`);
      setCopySourceSlotId(null);
    }
  };

  const handleRemove = (slot: MealSlot) => {
    if (slot.recipe && onRemoveRecipe) {
      const recipeName = slot.recipe.nama;
      onRemoveRecipe(slot.id);
      toast.success(`"${recipeName}" dihapus dari slot`);
    }
  };

  const renderCell = (slot: MealSlot | undefined, compact = false) => {
    if (!slot) return null;
    
    const isCopySource = copySourceSlotId !== null && copySourceSlotId !== slot.id;
    const isSelected = selectedSlotId === slot.id;
    const isClipboardSource = clipboardSlotId === slot.id;
    
    return (
      <div 
        onClick={() => setSelectedSlotId(slot.id)}
        className={isSelected ? "ring-2 ring-primary ring-offset-1 rounded-lg" : ""}
      >
        <MealPlanCell
          slot={slot}
          onToggleLock={() => onToggleLock(slot.id)}
          onToggleSkip={() => onToggleSkip(slot.id)}
          onViewDetail={() => onViewDetail(slot)}
          compact={compact}
          isDragging={draggingSlotId === slot.id}
          isDragOver={dragOverSlotId === slot.id}
          isCopySource={isCopySource || isClipboardSource}
          onDragStart={(e) => handleDragStart(e, slot)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, slot)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, slot)}
          onCopy={() => handleCopy(slot)}
          onPaste={() => handlePaste(slot)}
          onRemove={() => handleRemove(slot)}
        />
      </div>
    );
  };

  return (
    <div className="w-full relative" tabIndex={0}>
      {/* Selected slot indicator with keyboard hints */}
      {selectedSlotId && !clipboardSlotId && !copySourceSlotId && (
        <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between animate-fade-in">
          <span className="text-xs text-muted-foreground">
            ⌨️ Arrow keys: navigasi | Ctrl+C: copy | Ctrl+V: paste | Delete: hapus | Enter: lihat detail | ESC: batal
          </span>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {clipboardSlotId && (
        <div className="mb-3 p-2 rounded-lg bg-muted/50 border border-border flex items-center justify-between animate-fade-in">
          <span className="text-sm text-muted-foreground">
            📋 Resep di clipboard - pilih slot dan tekan Ctrl+V untuk paste
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => {
              setClipboardSlotId(null);
              toast.info("Clipboard dikosongkan");
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        </div>
      )}
      
      {/* Copy mode indicator */}
      {copySourceSlotId && (
        <div className="mb-3 p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between animate-fade-in">
          <span className="text-sm text-primary">
            Mode copy aktif - klik slot tujuan untuk menempel resep
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-primary"
            onClick={() => {
              setCopySourceSlotId(null);
              toast.info("Mode copy dibatalkan");
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Batal
          </Button>
        </div>
      )}
      
      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground w-24"></th>
                {DAYS.map((day, idx) => (
                  <th key={day} className="p-2 text-center">
                    <div className="text-sm font-medium">{day}</div>
                    <div className="text-xs text-muted-foreground">
                      {getFormattedDate(mealPlan.weekStart, idx)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TIMES.map(({ key, label }) => (
                <tr key={key}>
                  <td className="p-2 text-sm font-medium text-muted-foreground align-top">
                    {label}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const slot = getSlot(dayIndex, key);
                    return (
                      <td key={dayIndex} className="p-1">
                        {renderCell(slot)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Horizontal Scroll View */}
      <div className="md:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex-shrink-0 w-[280px]">
                <div className="mb-2 text-center">
                  <div className="text-sm font-medium">{day}</div>
                  <div className="text-xs text-muted-foreground">
                    {getFormattedDate(mealPlan.weekStart, dayIndex)}
                  </div>
                </div>
                <div className="space-y-2">
                  {MEAL_TIMES.map(({ key, label }) => {
                    const slot = getSlot(dayIndex, key);
                    return (
                      <div key={key}>
                        <div className="text-xs text-muted-foreground mb-1">{label}</div>
                        {renderCell(slot, true)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

// Helper to format date
function getFormattedDate(weekStart: string, dayOffset: number): string {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
