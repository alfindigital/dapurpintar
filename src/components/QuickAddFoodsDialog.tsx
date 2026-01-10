import { useState, useMemo, useRef } from "react";
import { Plus, Search, Utensils, Zap, PlusCircle, Trash2, Star, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

function FoodItem({ 
  food, 
  onAdd,
  onDelete,
  isCustom = false,
}: { 
  food: QuickFood | CustomFood; 
  onAdd: (food: QuickFood | CustomFood) => void;
  onDelete?: (id: string) => void;
  isCustom?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center gap-1.5">
          {isCustom && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
          {food.nama}
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
          onClick={() => onAdd(food)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function QuickAddFoodsDialog({ onAddFood }: QuickAddFoodsDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState<string>("semua");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { customFoods, addCustomFood, removeCustomFood, exportCustomFoods, importCustomFoods } = useCustomFoods();

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
    
    return foods;
  }, [search, activeKategori, allFoods, customFoods]);

  const groupedFoods = useMemo(() => {
    if (activeKategori === "custom") {
      return { custom: filteredFoods };
    }
    
    if (activeKategori !== "semua") {
      return { [activeKategori]: filteredFoods };
    }
    
    const grouped: Record<string, (QuickFood | CustomFood)[]> = {};
    
    // Add custom foods first if any
    const customItems = filteredFoods.filter(f => 'isCustom' in f && f.isCustom);
    if (customItems.length > 0) {
      grouped['custom'] = customItems;
    }
    
    // Then add regular foods by category
    KATEGORI_ORDER.forEach(kategori => {
      const foods = filteredFoods.filter(f => 
        f.kategori === kategori && !('isCustom' in f && f.isCustom)
      );
      if (foods.length > 0) {
        grouped[kategori] = foods;
      }
    });
    return grouped;
  }, [filteredFoods, activeKategori]);

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
    addCustomFood(food);
    setShowCustomForm(false);
    toast.success(`${food.nama} berhasil disimpan`);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importCustomFoods(content, 'merge');
      
      if (result.success) {
        toast.success(`${result.count} makanan berhasil diimpor`);
      } else {
        toast.error(result.error || "Gagal mengimpor data");
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
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
              <PlusCircle className="h-4 w-4" />
              Tambah Makanan Custom
            </h3>
            <CustomFoodForm 
              onSubmit={handleAddCustomFood}
              onCancel={() => setShowCustomForm(false)}
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
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
                          {activeKategori === "semua" && (
                            <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
                              {kategori === 'custom' ? (
                                <>
                                  <Star className="h-3 w-3 text-amber-500" />
                                  Makanan Custom
                                </>
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
                                isCustom={'isCustom' in food && food.isCustom}
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
  );
}
