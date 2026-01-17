import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Plus, Search, Utensils, Zap, PlusCircle, Trash2, Star, Download, Upload, Scale, Pencil, RotateCcw, X, ArrowUpDown, ArrowUp, ArrowDown, Heart, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { QUICK_FOODS, KATEGORI_LABELS, KATEGORI_ORDER, QuickFood } from "@/lib/quickFoodsData";
import { useCustomFoods, CustomFood } from "@/hooks/useCustomFoods";
import { CustomFoodForm } from "@/components/CustomFoodForm";
import { toast } from "sonner";

interface QuickAddFoodsDialogProps {
  onAddFood: (food: {
    nama: string;
    kalori: number;
    protein: number;
    karbohidrat: number;
    lemak: number;
    waktu: string;
  }) => void;
}

const PORTION_MULTIPLIERS = [
  { value: "0.5", label: "½", display: "0.5x" },
  { value: "1", label: "1", display: "1x" },
  { value: "1.5", label: "1½", display: "1.5x" },
  { value: "2", label: "2", display: "2x" },
];

const PORTION_PREFS_KEY = 'portion_preferences';
const SORT_PREF_KEY = 'quick_add_sort_preference';
const FOOD_FAVORITES_KEY = 'quick_add_food_favorites';

function getFoodFavorites(): Set<string> {
  try {
    const saved = localStorage.getItem(FOOD_FAVORITES_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFoodFavorites(favorites: Set<string>) {
  try {
    localStorage.setItem(FOOD_FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch {
    // ignore
  }
}

function isFoodFavorite(foodId: string): boolean {
  return getFoodFavorites().has(foodId);
}

function toggleFoodFavorite(foodId: string): boolean {
  const favorites = getFoodFavorites();
  const isNowFavorite = !favorites.has(foodId);
  if (isNowFavorite) {
    favorites.add(foodId);
  } else {
    favorites.delete(foodId);
  }
  saveFoodFavorites(favorites);
  return isNowFavorite;
}

interface PortionPreference {
  multiplier: string;
  isCustom: boolean;
}

function getPortionPreferences(): Record<string, PortionPreference> {
  try {
    const saved = localStorage.getItem(PORTION_PREFS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function clearAllPortionPreferences(): number {
  try {
    const prefs = getPortionPreferences();
    const count = Object.keys(prefs).length;
    localStorage.removeItem(PORTION_PREFS_KEY);
    return count;
  } catch {
    return 0;
  }
}

function clearPortionPreference(foodId: string): boolean {
  try {
    const prefs = getPortionPreferences();
    if (prefs[foodId]) {
      delete prefs[foodId];
      localStorage.setItem(PORTION_PREFS_KEY, JSON.stringify(prefs));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function hasPortionPreference(foodId: string): boolean {
  const prefs = getPortionPreferences();
  return !!prefs[foodId];
}

function savePortionPreference(foodId: string, multiplier: string, isCustom: boolean) {
  try {
    const prefs = getPortionPreferences();
    prefs[foodId] = { multiplier, isCustom };
    localStorage.setItem(PORTION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function FoodItem({ 
  food, 
  onAdd,
  onDelete,
  onEdit,
  onPortionPrefCleared,
  onFavoriteToggle,
  isCustom = false,
  isFavorite = false,
}: { 
  food: QuickFood | CustomFood; 
  onAdd: (food: QuickFood | CustomFood) => void;
  onDelete?: (id: string) => void;
  onEdit?: (food: CustomFood) => void;
  onPortionPrefCleared?: () => void;
  onFavoriteToggle?: (foodId: string) => void;
  isCustom?: boolean;
  isFavorite?: boolean;
}) {
  const [showPortion, setShowPortion] = useState(false);
  const [multiplier, setMultiplier] = useState("1");
  const [customMultiplier, setCustomMultiplier] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [hasSavedPref, setHasSavedPref] = useState(() => hasPortionPreference(food.id));

  // Load saved portion preference when showing portion selector
  const loadSavedPreference = useCallback(() => {
    const prefs = getPortionPreferences();
    const pref = prefs[food.id];
    if (pref) {
      if (pref.isCustom) {
        setCustomMultiplier(pref.multiplier);
        setUseCustom(true);
        setMultiplier("1");
      } else {
        setMultiplier(pref.multiplier);
        setUseCustom(false);
        setCustomMultiplier("");
      }
    }
  }, [food.id]);

  const effectiveMultiplier = useCustom ? customMultiplier : multiplier;
  
  const adjustedNutrition = useMemo(() => {
    const mult = parseFloat(effectiveMultiplier) || 0;
    return {
      kalori: Math.round(food.kalori * mult),
      protein: Math.round(food.protein * mult * 10) / 10,
      karbohidrat: Math.round(food.karbohidrat * mult * 10) / 10,
      lemak: Math.round(food.lemak * mult * 10) / 10,
    };
  }, [food, effectiveMultiplier]);

  const handleQuickAdd = () => {
    loadSavedPreference();
    setShowPortion(true);
  };

  const handleConfirmAdd = () => {
    const mult = parseFloat(effectiveMultiplier) || 0;
    if (mult <= 0) {
      return;
    }
    
    // Save portion preference
    savePortionPreference(food.id, effectiveMultiplier, useCustom);
    setHasSavedPref(true);
    
    const displayMultiplier = useCustom 
      ? `${mult}x` 
      : PORTION_MULTIPLIERS.find(p => p.value === multiplier)?.display || `${mult}x`;
    
    const adjustedFood = {
      ...food,
      nama: mult !== 1 ? `${food.nama} (${displayMultiplier})` : food.nama,
      kalori: adjustedNutrition.kalori,
      protein: adjustedNutrition.protein,
      karbohidrat: adjustedNutrition.karbohidrat,
      lemak: adjustedNutrition.lemak,
    };
    onAdd(adjustedFood);
    setShowPortion(false);
    setMultiplier("1");
    setCustomMultiplier("");
    setUseCustom(false);
  };

  const handleCancel = () => {
    setShowPortion(false);
    setMultiplier("1");
    setCustomMultiplier("");
    setUseCustom(false);
  };

  const handleClearPref = () => {
    clearPortionPreference(food.id);
    setHasSavedPref(false);
    setMultiplier("1");
    setCustomMultiplier("");
    setUseCustom(false);
    onPortionPrefCleared?.();
  };
  
  const handlePresetChange = (val: string) => {
    if (val) {
      setMultiplier(val);
      setUseCustom(false);
      setCustomMultiplier("");
    }
  };
  
  const handleCustomChange = (val: string) => {
    // Only allow valid number input
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setCustomMultiplier(val);
      setUseCustom(true);
    }
  };

  if (showPortion) {
    return (
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-primary" />
            {isCustom && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
            {food.nama}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Porsi dasar: {food.porsi}
          </div>
          {hasSavedPref && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClearPref}
              title="Hapus preferensi porsi tersimpan"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup 
            type="single" 
            value={useCustom ? "" : multiplier} 
            onValueChange={handlePresetChange}
            className="justify-start gap-1"
          >
            {PORTION_MULTIPLIERS.map(p => (
              <ToggleGroupItem 
                key={p.value} 
                value={p.value}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3"
              >
                {p.label}x
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          
          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="..."
              value={customMultiplier}
              onChange={(e) => handleCustomChange(e.target.value)}
              className={`w-14 h-8 text-center text-sm px-1 ${useCustom ? 'ring-2 ring-primary' : ''}`}
            />
            <span className="text-xs text-muted-foreground">x</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {adjustedNutrition.kalori} kkal
          </Badge>
          <Badge variant="outline" className="text-xs">
            P: {adjustedNutrition.protein}g
          </Badge>
          <Badge variant="outline" className="text-xs">
            K: {adjustedNutrition.karbohidrat}g
          </Badge>
          <Badge variant="outline" className="text-xs">
            L: {adjustedNutrition.lemak}g
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
            Batal
          </Button>
          <Button size="sm" onClick={handleConfirmAdd} className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center gap-1.5">
          {isCustom && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
          {food.nama}
          {hasSavedPref && (
            <Badge 
              variant="secondary" 
              className="text-[9px] px-1 py-0 ml-1 animate-scale-in"
            >
              porsi tersimpan
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {food.porsi} • {food.kalori} kkal
        </div>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            P: {food.protein}g
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            K: {food.karbohidrat}g
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            L: {food.lemak}g
          </Badge>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 ${isFavorite ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
          onClick={() => onFavoriteToggle?.(food.id)}
          title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        {isCustom && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(food as CustomFood)}
            title="Edit makanan"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {isCustom && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(food.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={handleQuickAdd}
          title="Klik untuk atur porsi"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type SortOption = 'default' | 'nama-asc' | 'nama-desc' | 'kalori-asc' | 'kalori-desc' | 'protein-asc' | 'protein-desc' | 'karbohidrat-asc' | 'karbohidrat-desc' | 'lemak-asc' | 'lemak-desc';

const SORT_OPTIONS: { value: SortOption; label: string; icon?: 'asc' | 'desc' }[] = [
  { value: 'default', label: 'Default' },
  { value: 'nama-asc', label: 'Nama (A-Z)', icon: 'asc' },
  { value: 'nama-desc', label: 'Nama (Z-A)', icon: 'desc' },
  { value: 'kalori-asc', label: 'Kalori (Rendah)', icon: 'asc' },
  { value: 'kalori-desc', label: 'Kalori (Tinggi)', icon: 'desc' },
  { value: 'protein-asc', label: 'Protein (Rendah)', icon: 'asc' },
  { value: 'protein-desc', label: 'Protein (Tinggi)', icon: 'desc' },
  { value: 'karbohidrat-asc', label: 'Karbo (Rendah)', icon: 'asc' },
  { value: 'karbohidrat-desc', label: 'Karbo (Tinggi)', icon: 'desc' },
  { value: 'lemak-asc', label: 'Lemak (Rendah)', icon: 'asc' },
  { value: 'lemak-desc', label: 'Lemak (Tinggi)', icon: 'desc' },
];

type CalorieRange = 'all' | '0-100' | '100-200' | '200-300' | '300-500' | '500+';

const CALORIE_RANGES: { value: CalorieRange; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'Semua Kalori', min: 0, max: Infinity },
  { value: '0-100', label: '0-100 kkal', min: 0, max: 100 },
  { value: '100-200', label: '100-200 kkal', min: 100, max: 200 },
  { value: '200-300', label: '200-300 kkal', min: 200, max: 300 },
  { value: '300-500', label: '300-500 kkal', min: 300, max: 500 },
  { value: '500+', label: '500+ kkal', min: 500, max: Infinity },
];

const CALORIE_FILTER_KEY = 'quick_add_calorie_filter';

export function QuickAddFoodsDialog({ onAddFood }: QuickAddFoodsDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState<string>("semua");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<string | null>(null);
  const [portionPrefsCount, setPortionPrefsCount] = useState(0);
  const [foodFavorites, setFoodFavorites] = useState<Set<string>>(() => getFoodFavorites());
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    try {
      const saved = localStorage.getItem(SORT_PREF_KEY);
      if (saved && SORT_OPTIONS.some(o => o.value === saved)) {
        return saved as SortOption;
      }
    } catch {}
    return 'default';
  });
  const [calorieFilter, setCalorieFilter] = useState<CalorieRange>(() => {
    try {
      const saved = localStorage.getItem(CALORIE_FILTER_KEY);
      if (saved && CALORIE_RANGES.some(r => r.value === saved)) {
        return saved as CalorieRange;
      }
    } catch {}
    return 'all';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save sort preference when it changes
  useEffect(() => {
    try {
      if (sortBy === 'default') {
        localStorage.removeItem(SORT_PREF_KEY);
      } else {
        localStorage.setItem(SORT_PREF_KEY, sortBy);
      }
    } catch {}
  }, [sortBy]);

  // Save calorie filter preference when it changes
  useEffect(() => {
    try {
      if (calorieFilter === 'all') {
        localStorage.removeItem(CALORIE_FILTER_KEY);
      } else {
        localStorage.setItem(CALORIE_FILTER_KEY, calorieFilter);
      }
    } catch {}
  }, [calorieFilter]);
  
  const { customFoods, addCustomFood, removeCustomFood, updateCustomFood, exportCustomFoods, importCustomFoods } = useCustomFoods();

  // Combine quick foods with custom foods
  const allFoods = useMemo(() => {
    return [...customFoods, ...QUICK_FOODS];
  }, [customFoods]);

  const filteredFoods = useMemo(() => {
    let foods = allFoods;
    
    // Filter by kategori - "custom" shows only custom foods
    if (activeKategori === "custom") {
      foods = customFoods;
    } else if (activeKategori !== "semua") {
      foods = foods.filter(f => f.kategori === activeKategori);
    }
    
    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      foods = foods.filter(f => 
        f.nama.toLowerCase().includes(searchLower)
      );
    }

    // Filter by calorie range
    if (calorieFilter !== 'all') {
      const range = CALORIE_RANGES.find(r => r.value === calorieFilter);
      if (range) {
        foods = foods.filter(f => f.kalori >= range.min && f.kalori < range.max);
      }
    }
    
    return foods;
  }, [search, activeKategori, allFoods, customFoods, calorieFilter]);

  // Apply sorting with favorites at top
  const sortedFoods = useMemo(() => {
    const sortFunction = (a: QuickFood | CustomFood, b: QuickFood | CustomFood) => {
      // Favorites always come first
      const aIsFav = foodFavorites.has(a.id);
      const bIsFav = foodFavorites.has(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      
      // Then apply the selected sort
      if (sortBy === 'default') return 0;
      
      switch (sortBy) {
        case 'nama-asc':
          return a.nama.localeCompare(b.nama, 'id');
        case 'nama-desc':
          return b.nama.localeCompare(a.nama, 'id');
        case 'kalori-asc':
          return a.kalori - b.kalori;
        case 'kalori-desc':
          return b.kalori - a.kalori;
        case 'protein-asc':
          return a.protein - b.protein;
        case 'protein-desc':
          return b.protein - a.protein;
        case 'karbohidrat-asc':
          return a.karbohidrat - b.karbohidrat;
        case 'karbohidrat-desc':
          return b.karbohidrat - a.karbohidrat;
        case 'lemak-asc':
          return a.lemak - b.lemak;
        case 'lemak-desc':
          return b.lemak - a.lemak;
        default:
          return 0;
      }
    };

    return [...filteredFoods].sort(sortFunction);
  }, [filteredFoods, sortBy, foodFavorites]);

  const groupedFoods = useMemo(() => {
    // When sorting is active, show as flat list
    if (sortBy !== 'default') {
      return { sorted: sortedFoods };
    }

    if (activeKategori === "custom") {
      return { custom: sortedFoods };
    }
    
    if (activeKategori !== "semua") {
      return { [activeKategori]: sortedFoods };
    }
    
    const grouped: Record<string, (QuickFood | CustomFood)[]> = {};
    
    // Add favorites first
    const favoriteItems = sortedFoods.filter(f => foodFavorites.has(f.id));
    if (favoriteItems.length > 0) {
      grouped['favorites'] = favoriteItems;
    }
    
    // Add custom foods (non-favorite)
    const customItems = sortedFoods.filter(f => 
      'isCustom' in f && f.isCustom && !foodFavorites.has(f.id)
    );
    if (customItems.length > 0) {
      grouped['custom'] = customItems;
    }
    
    // Then add regular foods by category (non-favorite)
    KATEGORI_ORDER.forEach(kategori => {
      const foods = sortedFoods.filter(f => 
        f.kategori === kategori && 
        !('isCustom' in f && f.isCustom) && 
        !foodFavorites.has(f.id)
      );
      if (foods.length > 0) {
        grouped[kategori] = foods;
      }
    });
    return grouped;
  }, [sortedFoods, activeKategori, sortBy, foodFavorites]);

  const handleAddFood = (food: QuickFood | CustomFood) => {
    const now = new Date();
    const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    onAddFood({
      nama: food.nama,
      kalori: food.kalori,
      protein: food.protein,
      karbohidrat: food.karbohidrat,
      lemak: food.lemak,
      waktu,
    });
    
    toast.success(`${food.nama} ditambahkan ke nutrisi harian`);
  };

  const handleAddCustomFood = (food: Omit<QuickFood, 'id'>) => {
    if (editingFood) {
      updateCustomFood(editingFood.id, food);
      setEditingFood(null);
      setShowCustomForm(false);
      toast.success(`${food.nama} berhasil diupdate`);
    } else {
      addCustomFood(food);
      setShowCustomForm(false);
      toast.success(`${food.nama} berhasil disimpan`);
    }
  };

  const handleEditCustomFood = (food: CustomFood) => {
    setEditingFood(food);
    setShowCustomForm(true);
  };

  const handleCancelForm = () => {
    setShowCustomForm(false);
    setEditingFood(null);
  };

  const handleDeleteCustomFood = (id: string) => {
    removeCustomFood(id);
    toast.success("Makanan custom dihapus");
  };

  const handleExport = () => {
    const count = exportCustomFoods();
    if (count > 0) {
      toast.success(`${count} makanan custom berhasil diekspor`);
    } else {
      toast.error("Tidak ada makanan custom untuk diekspor");
    }
  };

  const handleImportClick = (mode: 'merge' | 'replace') => {
    setImportMode(mode);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      if (importMode === 'replace' && customFoods.length > 0) {
        // Show confirmation for replace mode
        setPendingImportContent(content);
        setShowReplaceConfirm(true);
      } else {
        // Direct import for merge mode or when no existing data
        const result = importCustomFoods(content, importMode);
        if (result.success) {
          toast.success(`${result.count} makanan berhasil diimpor`);
        } else {
          toast.error(result.error || "Gagal mengimpor data");
        }
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmReplace = () => {
    if (pendingImportContent) {
      const result = importCustomFoods(pendingImportContent, 'replace');
      if (result.success) {
        toast.success(`${result.count} makanan berhasil diimpor (data lama diganti)`);
      } else {
        toast.error(result.error || "Gagal mengimpor data");
      }
    }
    setPendingImportContent(null);
    setShowReplaceConfirm(false);
  };

  const handleResetPortionPreferences = () => {
    const count = clearAllPortionPreferences();
    setPortionPrefsCount(0);
    // Force re-render of FoodItems
    setSearch(prev => prev + ' ');
    setTimeout(() => setSearch(prev => prev.trim()), 0);
    if (count > 0) {
      toast.success(`${count} preferensi porsi berhasil dihapus`);
    } else {
      toast.info("Tidak ada preferensi porsi yang tersimpan");
    }
  };

  const handlePortionPrefCleared = () => {
    setPortionPrefsCount(prev => Math.max(0, prev - 1));
  };

  const handleFavoriteToggle = (foodId: string) => {
    const isNowFavorite = toggleFoodFavorite(foodId);
    setFoodFavorites(getFoodFavorites());
    toast.success(isNowFavorite ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
  };

  // Update portion prefs count when dialog opens
  useEffect(() => {
    if (open) {
      const prefs = getPortionPreferences();
      setPortionPrefsCount(Object.keys(prefs).length);
    }
  }, [open]);

  return (
    <>
    <AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ganti Semua Data?</AlertDialogTitle>
          <AlertDialogDescription>
            Semua {customFoods.length} makanan custom yang ada akan dihapus dan diganti dengan data dari file. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingImportContent(null)}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmReplace}>
            Ya, Ganti Semua
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Zap className="h-4 w-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Quick Add Makanan
          </DialogTitle>
        </DialogHeader>
        
        {showCustomForm ? (
          <div className="py-2">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              {editingFood ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Makanan Custom
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Tambah Makanan Custom
                </>
              )}
            </h3>
            <CustomFoodForm 
              onSubmit={handleAddCustomFood}
              onCancel={handleCancelForm}
              initialData={editingFood}
              isEditMode={!!editingFood}
            />
          </div>
        ) : (
          <>
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Search + Actions */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari makanan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Add Custom Button */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowCustomForm(true)}
                title="Tambah makanan custom"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              
              {/* Import/Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="Import/Export">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExport} disabled={customFoods.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export ({customFoods.length})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleImportClick('merge')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import (Gabung)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImportClick('replace')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import (Ganti Semua)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleResetPortionPreferences} disabled={portionPrefsCount === 0}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Preferensi Porsi {portionPrefsCount > 0 && `(${portionPrefsCount})`}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={sortBy !== 'default' ? 'secondary' : 'outline'} 
                    size="icon" 
                    title="Urutkan"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-accent' : ''}
                    >
                      {option.icon === 'asc' && <ArrowUp className="h-3 w-3 mr-2" />}
                      {option.icon === 'desc' && <ArrowDown className="h-3 w-3 mr-2" />}
                      {!option.icon && <span className="w-5" />}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Calorie Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={calorieFilter !== 'all' ? 'secondary' : 'outline'} 
                    size="icon" 
                    title="Filter Kalori"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {CALORIE_RANGES.map((range) => (
                    <DropdownMenuItem 
                      key={range.value}
                      onClick={() => setCalorieFilter(range.value)}
                      className={calorieFilter === range.value ? 'bg-accent' : ''}
                    >
                      {range.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filters Indicator */}
            {(sortBy !== 'default' || calorieFilter !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground animate-fade-in">
                {sortBy !== 'default' && (
                  <Badge variant="secondary" className="gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => setSortBy('default')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {calorieFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Filter className="h-3 w-3" />
                    {CALORIE_RANGES.find(r => r.value === calorieFilter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => setCalorieFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {(sortBy !== 'default' && calorieFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSortBy('default');
                      setCalorieFilter('all');
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset Semua
                  </Button>
                )}
              </div>
            )}

            {/* Kategori Tabs */}
            <Tabs value={activeKategori} onValueChange={setActiveKategori} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="semua" className="text-xs px-2 py-1">
                  Semua
                </TabsTrigger>
                <TabsTrigger value="custom" className="text-xs px-2 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Custom
                </TabsTrigger>
                {KATEGORI_ORDER.map(kategori => (
                  <TabsTrigger key={kategori} value={kategori} className="text-xs px-2 py-1">
                    {KATEGORI_LABELS[kategori]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeKategori} className="flex-1 mt-3 min-h-0">
                <ScrollArea className="h-[350px] pr-3">
                  {Object.keys(groupedFoods).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {activeKategori === "custom" 
                          ? "Belum ada makanan custom" 
                          : "Tidak ada makanan ditemukan"}
                      </p>
                      {activeKategori === "custom" && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowCustomForm(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Tambah sekarang
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedFoods).map(([kategori, foods]) => (
                        <div key={kategori}>
                          {activeKategori === "semua" && sortBy === 'default' && (
                            <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
                              {kategori === 'favorites' ? (
                                <>
                                  <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                                  Favorit
                                </>
                              ) : kategori === 'custom' ? (
                                <>
                                  <Star className="h-3 w-3 text-amber-500" />
                                  Makanan Custom
                                </>
                              ) : kategori === 'sorted' ? (
                                'Hasil Pengurutan'
                              ) : (
                                KATEGORI_LABELS[kategori as QuickFood['kategori']]
                              )}
                            </h3>
                          )}
                          <div className="space-y-2">
                            {foods.map(food => (
                              <FoodItem 
                                key={food.id} 
                                food={food} 
                                onAdd={handleAddFood}
                                onDelete={handleDeleteCustomFood}
                                onEdit={handleEditCustomFood}
                                onPortionPrefCleared={handlePortionPrefCleared}
                                onFavoriteToggle={handleFavoriteToggle}
                                isCustom={'isCustom' in food && food.isCustom}
                                isFavorite={foodFavorites.has(food.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              {allFoods.length} makanan tersedia ({customFoods.length} custom) • Klik + untuk menambahkan
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
