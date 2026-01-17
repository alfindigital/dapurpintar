import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Plus, Search, Utensils, Zap, PlusCircle, Trash2, Star, Download, Upload, Scale, Pencil, RotateCcw, X, ArrowUpDown, ArrowUp, ArrowDown, Heart, Filter, Beef, Wheat, Droplets, Sparkles, Save, BookmarkPlus } from "lucide-react";
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

type ProteinRange = 'all' | 'low' | 'medium' | 'high';

const PROTEIN_RANGES: { value: ProteinRange; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'Semua Protein', min: 0, max: Infinity },
  { value: 'low', label: 'Rendah (<10g)', min: 0, max: 10 },
  { value: 'medium', label: 'Sedang (10-20g)', min: 10, max: 20 },
  { value: 'high', label: 'Tinggi (>20g)', min: 20, max: Infinity },
];

const PROTEIN_FILTER_KEY = 'quick_add_protein_filter';

type CarbRange = 'all' | 'low' | 'medium' | 'high';

const CARB_RANGES: { value: CarbRange; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'Semua Karbo', min: 0, max: Infinity },
  { value: 'low', label: 'Rendah (<15g)', min: 0, max: 15 },
  { value: 'medium', label: 'Sedang (15-30g)', min: 15, max: 30 },
  { value: 'high', label: 'Tinggi (>30g)', min: 30, max: Infinity },
];

const CARB_FILTER_KEY = 'quick_add_carb_filter';

type FatRange = 'all' | 'low' | 'medium' | 'high';

const FAT_RANGES: { value: FatRange; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'Semua Lemak', min: 0, max: Infinity },
  { value: 'low', label: 'Rendah (<5g)', min: 0, max: 5 },
  { value: 'medium', label: 'Sedang (5-15g)', min: 5, max: 15 },
  { value: 'high', label: 'Tinggi (>15g)', min: 15, max: Infinity },
];

const FAT_FILTER_KEY = 'quick_add_fat_filter';
const CUSTOM_PRESETS_KEY = 'quick_add_custom_presets';
const CUSTOM_PRESETS_SORT_KEY = 'quick_add_custom_presets_sort';

type CustomPresetSortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

const CUSTOM_PRESET_SORT_OPTIONS: { value: CustomPresetSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Nama (A-Z)' },
  { value: 'name-desc', label: 'Nama (Z-A)' },
  { value: 'date-desc', label: 'Terbaru' },
  { value: 'date-asc', label: 'Terlama' },
];

// Filter Presets
type FilterPreset = 'none' | 'high-protein' | 'low-carb' | 'low-fat' | 'low-calorie' | 'bulking';

interface FilterSettings {
  calorie?: CalorieRange;
  protein?: ProteinRange;
  carb?: CarbRange;
  fat?: FatRange;
}

interface PresetConfig {
  value: FilterPreset;
  label: string;
  description: string;
  icon: string;
  filters: FilterSettings;
}

interface CustomPreset {
  id: string;
  name: string;
  filters: FilterSettings;
  createdAt: number;
}

const FILTER_PRESETS: PresetConfig[] = [
  { 
    value: 'none', 
    label: 'Tanpa Preset', 
    description: 'Reset ke filter default',
    icon: '🔄',
    filters: {} 
  },
  { 
    value: 'high-protein', 
    label: 'Tinggi Protein', 
    description: 'Protein >20g, cocok untuk muscle building',
    icon: '💪',
    filters: { protein: 'high' } 
  },
  { 
    value: 'low-carb', 
    label: 'Rendah Karbo', 
    description: 'Karbo <15g, cocok untuk diet keto',
    icon: '🥗',
    filters: { carb: 'low' } 
  },
  { 
    value: 'low-fat', 
    label: 'Rendah Lemak', 
    description: 'Lemak <5g, cocok untuk cutting',
    icon: '🏃',
    filters: { fat: 'low' } 
  },
  { 
    value: 'low-calorie', 
    label: 'Rendah Kalori', 
    description: 'Kalori <200, cocok untuk diet',
    icon: '🎯',
    filters: { calorie: '0-100' } 
  },
  { 
    value: 'bulking', 
    label: 'Diet Bulking', 
    description: 'Tinggi protein & kalori untuk bulking',
    icon: '🔥',
    filters: { protein: 'high', calorie: '300-500' } 
  },
];

function getCustomPresets(): CustomPreset[] {
  try {
    const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCustomPresets(presets: CustomPreset[]) {
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

function generatePresetDescription(filters: FilterSettings): string {
  const parts: string[] = [];
  if (filters.calorie && filters.calorie !== 'all') {
    parts.push(CALORIE_RANGES.find(r => r.value === filters.calorie)?.label || '');
  }
  if (filters.protein && filters.protein !== 'all') {
    parts.push(PROTEIN_RANGES.find(r => r.value === filters.protein)?.label || '');
  }
  if (filters.carb && filters.carb !== 'all') {
    parts.push(CARB_RANGES.find(r => r.value === filters.carb)?.label || '');
  }
  if (filters.fat && filters.fat !== 'all') {
    parts.push(FAT_RANGES.find(r => r.value === filters.fat)?.label || '');
  }
  return parts.filter(Boolean).join(', ') || 'Tidak ada filter';
}

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
  const [proteinFilter, setProteinFilter] = useState<ProteinRange>(() => {
    try {
      const saved = localStorage.getItem(PROTEIN_FILTER_KEY);
      if (saved && PROTEIN_RANGES.some(r => r.value === saved)) {
        return saved as ProteinRange;
      }
    } catch {}
    return 'all';
  });
  const [carbFilter, setCarbFilter] = useState<CarbRange>(() => {
    try {
      const saved = localStorage.getItem(CARB_FILTER_KEY);
      if (saved && CARB_RANGES.some(r => r.value === saved)) {
        return saved as CarbRange;
      }
    } catch {}
    return 'all';
  });
  const [fatFilter, setFatFilter] = useState<FatRange>(() => {
    try {
      const saved = localStorage.getItem(FAT_FILTER_KEY);
      if (saved && FAT_RANGES.some(r => r.value === saved)) {
        return saved as FatRange;
      }
    } catch {}
    return 'all';
  });
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => getCustomPresets());
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState("");
  const [presetSortBy, setPresetSortBy] = useState<CustomPresetSortOption>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRESETS_SORT_KEY);
      if (saved && CUSTOM_PRESET_SORT_OPTIONS.some(o => o.value === saved)) {
        return saved as CustomPresetSortOption;
      }
    } catch {}
    return 'date-desc';
  });

  // Save preset sort preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PRESETS_SORT_KEY, presetSortBy);
    } catch {}
  }, [presetSortBy]);

  // Sort custom presets
  const sortedCustomPresets = useMemo(() => {
    return [...customPresets].sort((a, b) => {
      switch (presetSortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'id');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'id');
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'date-desc':
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });
  }, [customPresets, presetSortBy]);
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

  // Save protein filter preference when it changes
  useEffect(() => {
    try {
      if (proteinFilter === 'all') {
        localStorage.removeItem(PROTEIN_FILTER_KEY);
      } else {
        localStorage.setItem(PROTEIN_FILTER_KEY, proteinFilter);
      }
    } catch {}
  }, [proteinFilter]);

  // Save carb filter preference when it changes
  useEffect(() => {
    try {
      if (carbFilter === 'all') {
        localStorage.removeItem(CARB_FILTER_KEY);
      } else {
        localStorage.setItem(CARB_FILTER_KEY, carbFilter);
      }
    } catch {}
  }, [carbFilter]);

  // Save fat filter preference when it changes
  useEffect(() => {
    try {
      if (fatFilter === 'all') {
        localStorage.removeItem(FAT_FILTER_KEY);
      } else {
        localStorage.setItem(FAT_FILTER_KEY, fatFilter);
      }
    } catch {}
  }, [fatFilter]);
  
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

    // Filter by protein range
    if (proteinFilter !== 'all') {
      const range = PROTEIN_RANGES.find(r => r.value === proteinFilter);
      if (range) {
        foods = foods.filter(f => f.protein >= range.min && f.protein < range.max);
      }
    }

    // Filter by carb range
    if (carbFilter !== 'all') {
      const range = CARB_RANGES.find(r => r.value === carbFilter);
      if (range) {
        foods = foods.filter(f => f.karbohidrat >= range.min && f.karbohidrat < range.max);
      }
    }

    // Filter by fat range
    if (fatFilter !== 'all') {
      const range = FAT_RANGES.find(r => r.value === fatFilter);
      if (range) {
        foods = foods.filter(f => f.lemak >= range.min && f.lemak < range.max);
      }
    }
    
    return foods;
  }, [search, activeKategori, allFoods, customFoods, calorieFilter, proteinFilter, carbFilter, fatFilter]);

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

  const hasActiveFilters = calorieFilter !== 'all' || proteinFilter !== 'all' || carbFilter !== 'all' || fatFilter !== 'all';

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Nama preset tidak boleh kosong");
      return;
    }
    if (!hasActiveFilters) {
      toast.error("Pilih minimal satu filter untuk disimpan");
      return;
    }

    const newPreset: CustomPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      filters: {
        calorie: calorieFilter !== 'all' ? calorieFilter : undefined,
        protein: proteinFilter !== 'all' ? proteinFilter : undefined,
        carb: carbFilter !== 'all' ? carbFilter : undefined,
        fat: fatFilter !== 'all' ? fatFilter : undefined,
      },
      createdAt: Date.now(),
    };

    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    saveCustomPresets(updatedPresets);
    setNewPresetName("");
    setShowSavePreset(false);
    toast.success(`Preset "${newPreset.name}" berhasil disimpan`);
  };

  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = customPresets.find(p => p.id === presetId);
    const updatedPresets = customPresets.filter(p => p.id !== presetId);
    setCustomPresets(updatedPresets);
    saveCustomPresets(updatedPresets);
    toast.success(`Preset "${preset?.name}" berhasil dihapus`);
  };

  const handleStartEditPreset = (preset: CustomPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetId(preset.id);
    setEditingPresetName(preset.name);
  };

  const handleSaveEditPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingPresetName.trim()) {
      toast.error("Nama preset tidak boleh kosong");
      return;
    }
    const updatedPresets = customPresets.map(p => 
      p.id === presetId ? { ...p, name: editingPresetName.trim() } : p
    );
    setCustomPresets(updatedPresets);
    saveCustomPresets(updatedPresets);
    setEditingPresetId(null);
    setEditingPresetName("");
    toast.success("Nama preset berhasil diubah");
  };

  const handleCancelEditPreset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetId(null);
    setEditingPresetName("");
  };

  const handleApplyCustomPreset = (preset: CustomPreset) => {
    // Reset all filters first
    setCalorieFilter('all');
    setProteinFilter('all');
    setCarbFilter('all');
    setFatFilter('all');
    
    // Apply preset filters
    if (preset.filters.calorie) setCalorieFilter(preset.filters.calorie);
    if (preset.filters.protein) setProteinFilter(preset.filters.protein);
    if (preset.filters.carb) setCarbFilter(preset.filters.carb);
    if (preset.filters.fat) setFatFilter(preset.filters.fat);
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

              {/* Protein Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={proteinFilter !== 'all' ? 'secondary' : 'outline'} 
                    size="icon" 
                    title="Filter Protein"
                  >
                    <Beef className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {PROTEIN_RANGES.map((range) => (
                    <DropdownMenuItem 
                      key={range.value}
                      onClick={() => setProteinFilter(range.value)}
                      className={proteinFilter === range.value ? 'bg-accent' : ''}
                    >
                      {range.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Carb Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={carbFilter !== 'all' ? 'secondary' : 'outline'} 
                    size="icon" 
                    title="Filter Karbohidrat"
                  >
                    <Wheat className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {CARB_RANGES.map((range) => (
                    <DropdownMenuItem 
                      key={range.value}
                      onClick={() => setCarbFilter(range.value)}
                      className={carbFilter === range.value ? 'bg-accent' : ''}
                    >
                      {range.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fat Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={fatFilter !== 'all' ? 'secondary' : 'outline'} 
                    size="icon" 
                    title="Filter Lemak"
                  >
                    <Droplets className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {FAT_RANGES.map((range) => (
                    <DropdownMenuItem 
                      key={range.value}
                      onClick={() => setFatFilter(range.value)}
                      className={fatFilter === range.value ? 'bg-accent' : ''}
                    >
                      {range.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Preset Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={customPresets.length > 0 ? 'secondary' : 'outline'}
                    size="icon" 
                    title="Preset Filter"
                    className="relative"
                  >
                    <Sparkles className="h-4 w-4" />
                    {customPresets.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                        {customPresets.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover w-64">
                  {/* Custom Presets Section */}
                  {customPresets.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <BookmarkPlus className="h-3 w-3" />
                          Preset Saya ({customPresets.length})
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowUpDown className="h-3 w-3 mr-1" />
                              {CUSTOM_PRESET_SORT_OPTIONS.find(o => o.value === presetSortBy)?.label}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover z-50">
                            {CUSTOM_PRESET_SORT_OPTIONS.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPresetSortBy(option.value);
                                }}
                                className={presetSortBy === option.value ? 'bg-accent' : ''}
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {sortedCustomPresets.map((preset) => (
                        <div key={preset.id}>
                          {editingPresetId === preset.id ? (
                            <div className="flex items-center gap-2 px-2 py-2" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editingPresetName}
                                onChange={(e) => setEditingPresetName(e.target.value)}
                                className="h-8 text-sm flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEditPreset(preset.id, e as any);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditPreset(e as any);
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-primary hover:text-primary"
                                onClick={(e) => handleSaveEditPreset(preset.id, e)}
                                title="Simpan"
                              >
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground"
                                onClick={handleCancelEditPreset}
                                title="Batal"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleApplyCustomPreset(preset)}
                              className="flex items-center justify-between py-2 group"
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">⭐ {preset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {generatePresetDescription(preset.filters)}
                                </span>
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-primary/20 hover:text-primary"
                                  onClick={(e) => handleStartEditPreset(preset, e)}
                                  title="Edit nama preset"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                                  title="Hapus preset"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </DropdownMenuItem>
                          )}
                        </div>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Save Current Filters */}
                  {hasActiveFilters && !showSavePreset && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSavePreset(true);
                        }}
                        className="flex items-center gap-2 text-primary"
                      >
                        <Save className="h-4 w-4" />
                        <span>Simpan Filter Saat Ini</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Save Preset Form */}
                  {showSavePreset && (
                    <div className="px-2 py-2 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Simpan sebagai preset:
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        {generatePresetDescription({
                          calorie: calorieFilter !== 'all' ? calorieFilter : undefined,
                          protein: proteinFilter !== 'all' ? proteinFilter : undefined,
                          carb: carbFilter !== 'all' ? carbFilter : undefined,
                          fat: fatFilter !== 'all' ? fatFilter : undefined,
                        })}
                      </div>
                      <Input
                        placeholder="Nama preset..."
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveCustomPreset();
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs"
                          onClick={() => {
                            setShowSavePreset(false);
                            setNewPresetName("");
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={handleSaveCustomPreset}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showSavePreset && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Preset Bawaan
                      </div>
                      {FILTER_PRESETS.map((preset) => (
                        <DropdownMenuItem 
                          key={preset.value}
                          onClick={() => {
                            // Reset all filters first
                            setCalorieFilter('all');
                            setProteinFilter('all');
                            setCarbFilter('all');
                            setFatFilter('all');
                            
                            // Apply preset filters
                            if (preset.filters.calorie) setCalorieFilter(preset.filters.calorie);
                            if (preset.filters.protein) setProteinFilter(preset.filters.protein);
                            if (preset.filters.carb) setCarbFilter(preset.filters.carb);
                            if (preset.filters.fat) setFatFilter(preset.filters.fat);
                          }}
                          className="flex flex-col items-start py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span>{preset.icon}</span>
                            <span className="font-medium">{preset.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">{preset.description}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


            {/* Active Filters Indicator */}
            {(sortBy !== 'default' || calorieFilter !== 'all' || proteinFilter !== 'all' || carbFilter !== 'all' || fatFilter !== 'all') && (
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
                {proteinFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Beef className="h-3 w-3" />
                    {PROTEIN_RANGES.find(r => r.value === proteinFilter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => setProteinFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {carbFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Wheat className="h-3 w-3" />
                    {CARB_RANGES.find(r => r.value === carbFilter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => setCarbFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {fatFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Droplets className="h-3 w-3" />
                    {FAT_RANGES.find(r => r.value === fatFilter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => setFatFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {(sortBy !== 'default' || calorieFilter !== 'all' || proteinFilter !== 'all' || carbFilter !== 'all' || fatFilter !== 'all') && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sortedFoods.length} hasil
                    </Badge>
                    {([sortBy !== 'default', calorieFilter !== 'all', proteinFilter !== 'all', carbFilter !== 'all', fatFilter !== 'all'].filter(Boolean).length >= 2) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setSortBy('default');
                          setCalorieFilter('all');
                          setProteinFilter('all');
                          setCarbFilter('all');
                          setFatFilter('all');
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset Semua
                      </Button>
                    )}
                  </div>
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
                      {/* Check if filters are active */}
                      {(calorieFilter !== 'all' || proteinFilter !== 'all' || carbFilter !== 'all' || fatFilter !== 'all' || search.trim()) ? (
                        <>
                          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Tidak ada makanan yang cocok</p>
                          <p className="text-xs mt-1 max-w-[250px] mx-auto">
                            {search.trim() && `Pencarian "${search.trim()}" `}
                            {[
                              calorieFilter !== 'all' && CALORIE_RANGES.find(r => r.value === calorieFilter)?.label,
                              proteinFilter !== 'all' && PROTEIN_RANGES.find(r => r.value === proteinFilter)?.label,
                              carbFilter !== 'all' && CARB_RANGES.find(r => r.value === carbFilter)?.label,
                              fatFilter !== 'all' && FAT_RANGES.find(r => r.value === fatFilter)?.label,
                            ].filter(Boolean).join(', ')}
                          </p>
                          <div className="flex flex-col gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSearch('');
                                setCalorieFilter('all');
                                setProteinFilter('all');
                                setCarbFilter('all');
                                setFatFilter('all');
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reset Semua Filter
                            </Button>
                            <p className="text-[10px] text-muted-foreground/70">
                              Atau coba kurangi kriteria filter
                            </p>
                          </div>
                        </>
                      ) : activeKategori === "custom" ? (
                        <>
                          <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada makanan custom</p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setShowCustomForm(true)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Tambah sekarang
                          </Button>
                        </>
                      ) : (
                        <>
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Tidak ada makanan ditemukan</p>
                        </>
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
