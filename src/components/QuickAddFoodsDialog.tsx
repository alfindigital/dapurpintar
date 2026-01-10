import { useState, useMemo } from "react";
import { Plus, Search, Utensils, Zap } from "lucide-react";
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
import { QUICK_FOODS, KATEGORI_LABELS, KATEGORI_ORDER, QuickFood } from "@/lib/quickFoodsData";
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

function FoodItem({ food, onAdd }: { food: QuickFood; onAdd: (food: QuickFood) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{food.nama}</div>
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
      <Button
        size="sm"
        variant="secondary"
        className="h-8 w-8 p-0 shrink-0"
        onClick={() => onAdd(food)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function QuickAddFoodsDialog({ onAddFood }: QuickAddFoodsDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState<string>("semua");

  const filteredFoods = useMemo(() => {
    let foods = QUICK_FOODS;
    
    // Filter by kategori
    if (activeKategori !== "semua") {
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
  }, [search, activeKategori]);

  const groupedFoods = useMemo(() => {
    if (activeKategori !== "semua") {
      return { [activeKategori]: filteredFoods };
    }
    
    const grouped: Record<string, QuickFood[]> = {};
    KATEGORI_ORDER.forEach(kategori => {
      const foods = filteredFoods.filter(f => f.kategori === kategori);
      if (foods.length > 0) {
        grouped[kategori] = foods;
      }
    });
    return grouped;
  }, [filteredFoods, activeKategori]);

  const handleAddFood = (food: QuickFood) => {
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
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari makanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Kategori Tabs */}
        <Tabs value={activeKategori} onValueChange={setActiveKategori} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="semua" className="text-xs px-2 py-1">
              Semua
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
                  <p className="text-sm">Tidak ada makanan ditemukan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedFoods).map(([kategori, foods]) => (
                    <div key={kategori}>
                      {activeKategori === "semua" && (
                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                          {KATEGORI_LABELS[kategori as QuickFood['kategori']]}
                        </h3>
                      )}
                      <div className="space-y-2">
                        {foods.map(food => (
                          <FoodItem key={food.id} food={food} onAdd={handleAddFood} />
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
          {QUICK_FOODS.length} makanan tersedia • Klik + untuk menambahkan
        </div>
      </DialogContent>
    </Dialog>
  );
}
