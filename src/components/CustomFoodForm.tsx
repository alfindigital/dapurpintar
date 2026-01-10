import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KATEGORI_LABELS, KATEGORI_ORDER, QuickFood } from "@/lib/quickFoodsData";
import { toast } from "sonner";

interface CustomFoodFormProps {
  onSubmit: (food: Omit<QuickFood, 'id'>) => void;
  onCancel: () => void;
}

export function CustomFoodForm({ onSubmit, onCancel }: CustomFoodFormProps) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<QuickFood['kategori']>("lauk");
  const [kalori, setKalori] = useState("");
  const [protein, setProtein] = useState("");
  const [karbohidrat, setKarbohidrat] = useState("");
  const [lemak, setLemak] = useState("");
  const [porsi, setPorsi] = useState("1 porsi");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!nama.trim()) {
      toast.error("Nama makanan harus diisi");
      return;
    }
    
    const kaloriNum = parseFloat(kalori);
    const proteinNum = parseFloat(protein);
    const karboNum = parseFloat(karbohidrat);
    const lemakNum = parseFloat(lemak);
    
    if (isNaN(kaloriNum) || kaloriNum < 0) {
      toast.error("Kalori harus berupa angka positif");
      return;
    }
    
    onSubmit({
      nama: nama.trim(),
      kategori,
      kalori: kaloriNum,
      protein: isNaN(proteinNum) ? 0 : proteinNum,
      karbohidrat: isNaN(karboNum) ? 0 : karboNum,
      lemak: isNaN(lemakNum) ? 0 : lemakNum,
      porsi: porsi.trim() || "1 porsi",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nama">Nama Makanan *</Label>
        <Input
          id="nama"
          placeholder="Contoh: Ayam Geprek"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori</Label>
          <Select value={kategori} onValueChange={(v) => setKategori(v as QuickFood['kategori'])}>
            <SelectTrigger id="kategori">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KATEGORI_ORDER.map(k => (
                <SelectItem key={k} value={k}>
                  {KATEGORI_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="porsi">Ukuran Porsi</Label>
          <Input
            id="porsi"
            placeholder="1 porsi"
            value={porsi}
            onChange={(e) => setPorsi(e.target.value)}
            maxLength={20}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kalori">Kalori (kkal) *</Label>
        <Input
          id="kalori"
          type="number"
          placeholder="0"
          value={kalori}
          onChange={(e) => setKalori(e.target.value)}
          min="0"
          step="1"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="protein" className="text-xs">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="karbohidrat" className="text-xs">Karbo (g)</Label>
          <Input
            id="karbohidrat"
            type="number"
            placeholder="0"
            value={karbohidrat}
            onChange={(e) => setKarbohidrat(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lemak" className="text-xs">Lemak (g)</Label>
          <Input
            id="lemak"
            type="number"
            placeholder="0"
            value={lemak}
            onChange={(e) => setLemak(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="flex-1 gap-1.5">
          <Plus className="h-4 w-4" />
          Simpan
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        <Sparkles className="h-3 w-3 inline mr-1" />
        Makanan custom akan tersimpan di perangkat Anda
      </p>
    </form>
  );
}
