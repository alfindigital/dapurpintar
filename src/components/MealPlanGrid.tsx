import { useState } from "react";
import { WeeklyMealPlan, MealSlot, DAYS, MEAL_TIMES, MealTime } from "@/types/mealPlan";
import { MealPlanCell } from "./MealPlanCell";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface MealPlanGridProps {
  mealPlan: WeeklyMealPlan;
  onToggleLock: (slotId: string) => void;
  onToggleSkip: (slotId: string) => void;
  onViewDetail: (slot: MealSlot) => void;
  onSwapSlots?: (slotId1: string, slotId2: string) => void;
}

export const MealPlanGrid = ({
  mealPlan,
  onToggleLock,
  onToggleSkip,
  onViewDetail,
  onSwapSlots,
}: MealPlanGridProps) => {
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

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

  const renderCell = (slot: MealSlot | undefined, compact = false) => {
    if (!slot) return null;
    
    return (
      <MealPlanCell
        slot={slot}
        onToggleLock={() => onToggleLock(slot.id)}
        onToggleSkip={() => onToggleSkip(slot.id)}
        onViewDetail={() => onViewDetail(slot)}
        compact={compact}
        isDragging={draggingSlotId === slot.id}
        isDragOver={dragOverSlotId === slot.id}
        onDragStart={(e) => handleDragStart(e, slot)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, slot)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slot)}
      />
    );
  };

  return (
    <div className="w-full">
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
