import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { WeeklyMealPlan, MealSlot, DAYS, MEAL_TIMES, MealTime } from "@/types/mealPlan";
import { MealPlanCell } from "./MealPlanCell";
import { DragPreview } from "./DragPreview";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, ChevronUp, ChevronDown, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  const [draggingSlot, setDraggingSlot] = useState<MealSlot | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [copySourceSlotId, setCopySourceSlotId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [clipboardSlotId, setClipboardSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResultIndex, setSearchResultIndex] = useState<number>(0);
  const [mealTimeFilter, setMealTimeFilter] = useState<Set<MealTime>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<"locked" | "skipped" | "filled" | "empty">>(new Set());
  
  // Animation state for swapped slots
  const [swappedSlotIds, setSwappedSlotIds] = useState<Set<string>>(new Set());

  // Check if slot matches filters
  const slotMatchesFilters = useCallback((slot: MealSlot): boolean => {
    // Check meal time filter
    if (mealTimeFilter.size > 0 && !mealTimeFilter.has(slot.mealTime)) {
      return false;
    }
    
    // Check status filter
    if (statusFilter.size > 0) {
      const isLocked = slot.isLocked;
      const isSkipped = slot.isSkipped;
      const isFilled = !!slot.recipe;
      const isEmpty = !slot.recipe;
      
      const matchesStatus = 
        (statusFilter.has("locked") && isLocked) ||
        (statusFilter.has("skipped") && isSkipped) ||
        (statusFilter.has("filled") && isFilled) ||
        (statusFilter.has("empty") && isEmpty);
      
      if (!matchesStatus) return false;
    }
    
    return true;
  }, [mealTimeFilter, statusFilter]);

  // Get slots that match search query and filters (ordered by day and meal time)
  const matchingSlots = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mealPlan.slots
      .filter(slot => {
        // Must match filters first
        if (!slotMatchesFilters(slot)) return false;
        // Then match search query if present
        if (query && !slot.recipe?.nama?.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        const mealOrder: Record<MealTime, number> = { sarapan: 0, makan_siang: 1, makan_malam: 2 };
        return mealOrder[a.mealTime] - mealOrder[b.mealTime];
      });
  }, [mealPlan.slots, searchQuery, slotMatchesFilters]);

  const matchingSlotIds = useMemo(() => new Set(matchingSlots.map(s => s.id)), [matchingSlots]);

  const hasActiveFilters = mealTimeFilter.size > 0 || statusFilter.size > 0;
  const hasSearchOrFilter = searchQuery.trim() || hasActiveFilters;
  const hasSearchResults = hasSearchOrFilter && matchingSlots.length > 0;
  const hasNoResults = hasSearchOrFilter && matchingSlots.length === 0;

  // Toggle filter helpers
  const toggleMealTimeFilter = (mealTime: MealTime) => {
    setMealTimeFilter(prev => {
      const next = new Set(prev);
      if (next.has(mealTime)) {
        next.delete(mealTime);
      } else {
        next.add(mealTime);
      }
      return next;
    });
  };

  const toggleStatusFilter = (status: "locked" | "skipped" | "filled" | "empty") => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setMealTimeFilter(new Set());
    setStatusFilter(new Set());
    setSearchQuery("");
  };

  // Jump to search result
  const jumpToSearchResult = useCallback((direction: "next" | "prev") => {
    if (matchingSlots.length === 0) return;
    
    let newIndex: number;
    if (direction === "next") {
      newIndex = (searchResultIndex + 1) % matchingSlots.length;
    } else {
      newIndex = (searchResultIndex - 1 + matchingSlots.length) % matchingSlots.length;
    }
    
    setSearchResultIndex(newIndex);
    setSelectedSlotId(matchingSlots[newIndex].id);
    toast.info(`Hasil ${newIndex + 1} dari ${matchingSlots.length}: "${matchingSlots[newIndex].recipe?.nama}"`);
  }, [matchingSlots, searchResultIndex]);

  // Reset search result index when search query or filters change
  useEffect(() => {
    setSearchResultIndex(0);
    if (matchingSlots.length > 0 && hasSearchOrFilter) {
      setSelectedSlotId(matchingSlots[0].id);
    }
  }, [searchQuery, mealTimeFilter, statusFilter]);

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
      const isInSearchInput = e.target instanceof HTMLInputElement && 
        (e.target as HTMLInputElement).placeholder?.includes("Cari resep");

      // If in search input, handle search navigation
      if (isInSearchInput) {
        if (e.key === "Enter" && hasSearchResults) {
          e.preventDefault();
          jumpToSearchResult(e.shiftKey ? "prev" : "next");
          return;
        }
        if (e.key === "Escape") {
          setSearchQuery("");
          (e.target as HTMLInputElement).blur();
          return;
        }
        return;
      }

      // Ignore other inputs
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

      // If search is active, use arrow keys for search navigation
      if (hasSearchResults) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          jumpToSearchResult("next");
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          jumpToSearchResult("prev");
          return;
        }
      } else {
        // Normal arrow key navigation when no search
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
  }, [copySourceSlotId, selectedSlotId, clipboardSlotId, mealPlan.slots, onCopyToSlot, onRemoveRecipe, onViewDetail, navigateSlot, hasSearchResults, jumpToSearchResult]);

  const getSlot = (dayIndex: number, mealTime: MealTime): MealSlot | undefined => {
    return mealPlan.slots.find(
      slot => slot.dayIndex === dayIndex && slot.mealTime === mealTime
    );
  };

  // Use document-level mouse tracking for reliable drag preview position
  useEffect(() => {
    if (!draggingSlotId) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("dragover", handleMouseMove as EventListener);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("dragover", handleMouseMove as EventListener);
    };
  }, [draggingSlotId]);

  const handleDragStart = (e: React.DragEvent, slot: MealSlot) => {
    setDraggingSlotId(slot.id);
    setDraggingSlot(slot);
    setDragPosition({ x: e.clientX, y: e.clientY });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", slot.id);
    
    // Create invisible drag image to use our custom preview
    const emptyImg = document.createElement("img");
    emptyImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggingSlotId(null);
    setDraggingSlot(null);
    setDragOverSlotId(null);
  };

  const handleDrag = useCallback((_e: React.DragEvent) => {
    // Position is now tracked via document-level listener
  }, []);

  const handleDragOver = (e: React.DragEvent, slot: MealSlot) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (slot.id !== draggingSlotId) {
      setDragOverSlotId(slot.id);
    }
    // Update position from dragover event as backup
    if (e.clientX !== 0 || e.clientY !== 0) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: MealSlot) => {
    e.preventDefault();
    const sourceSlotId = e.dataTransfer.getData("text/plain");
    
    if (sourceSlotId && sourceSlotId !== targetSlot.id && onSwapSlots) {
      // Trigger swap animation
      setSwappedSlotIds(new Set([sourceSlotId, targetSlot.id]));
      
      // Perform the swap
      onSwapSlots(sourceSlotId, targetSlot.id);
      toast.success("Menu berhasil ditukar posisinya");
      
      // Clear animation after it completes
      setTimeout(() => {
        setSwappedSlotIds(new Set());
      }, 450);
    }
    
    setDraggingSlotId(null);
    setDraggingSlot(null);
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
    const isSearchMatch = matchingSlotIds.has(slot.id);
    const isDimmed = hasSearchOrFilter && !isSearchMatch;
    const isSwapped = swappedSlotIds.has(slot.id);
    
    return (
      <div 
        onClick={() => setSelectedSlotId(slot.id)}
        className={`transition-all duration-200 ${isSelected ? "ring-2 ring-primary ring-offset-1 rounded-lg" : ""} ${isSearchMatch ? "ring-2 ring-accent ring-offset-1 rounded-lg" : ""} ${isDimmed ? "opacity-30" : ""} ${isSwapped ? "animate-swap-bounce" : ""}`}
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
          onDrag={handleDrag}
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
      {/* Drag Preview */}
      <DragPreview slot={draggingSlot} position={dragPosition} />
      
      {/* Search/filter input */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari resep dalam meal plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {mealTimeFilter.size + statusFilter.size}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Waktu Makan</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={mealTimeFilter.has("sarapan")}
              onCheckedChange={() => toggleMealTimeFilter("sarapan")}
            >
              Sarapan
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={mealTimeFilter.has("makan_siang")}
              onCheckedChange={() => toggleMealTimeFilter("makan_siang")}
            >
              Makan Siang
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={mealTimeFilter.has("makan_malam")}
              onCheckedChange={() => toggleMealTimeFilter("makan_malam")}
            >
              Makan Malam
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status Slot</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={statusFilter.has("locked")}
              onCheckedChange={() => toggleStatusFilter("locked")}
            >
              🔒 Terkunci
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.has("skipped")}
              onCheckedChange={() => toggleStatusFilter("skipped")}
            >
              ⏭️ Dilewati
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.has("filled")}
              onCheckedChange={() => toggleStatusFilter("filled")}
            >
              ✅ Terisi
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.has("empty")}
              onCheckedChange={() => toggleStatusFilter("empty")}
            >
              ⬜ Kosong
            </DropdownMenuCheckboxItem>
            
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Semua Filter
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {mealTimeFilter.has("sarapan") && (
              <Badge variant="secondary" className="text-xs">
                Sarapan
                <button onClick={() => toggleMealTimeFilter("sarapan")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {mealTimeFilter.has("makan_siang") && (
              <Badge variant="secondary" className="text-xs">
                Makan Siang
                <button onClick={() => toggleMealTimeFilter("makan_siang")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {mealTimeFilter.has("makan_malam") && (
              <Badge variant="secondary" className="text-xs">
                Makan Malam
                <button onClick={() => toggleMealTimeFilter("makan_malam")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {statusFilter.has("locked") && (
              <Badge variant="secondary" className="text-xs">
                🔒 Terkunci
                <button onClick={() => toggleStatusFilter("locked")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {statusFilter.has("skipped") && (
              <Badge variant="secondary" className="text-xs">
                ⏭️ Dilewati
                <button onClick={() => toggleStatusFilter("skipped")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {statusFilter.has("filled") && (
              <Badge variant="secondary" className="text-xs">
                ✅ Terisi
                <button onClick={() => toggleStatusFilter("filled")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {statusFilter.has("empty") && (
              <Badge variant="secondary" className="text-xs">
                ⬜ Kosong
                <button onClick={() => toggleStatusFilter("empty")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        {hasSearchResults && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {searchResultIndex + 1}/{matchingSlots.length} ditemukan
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => jumpToSearchResult("prev")}
                title="Hasil sebelumnya (↑)"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => jumpToSearchResult("next")}
                title="Hasil berikutnya (↓)"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {hasNoResults && (
          <span className="text-xs text-destructive">
            Tidak ada slot yang cocok
          </span>
        )}
      </div>

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
