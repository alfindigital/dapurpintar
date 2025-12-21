import { Clock, Users, ChefHat, Heart, Share2, Printer, Utensils, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HelpTooltip } from "./HelpTooltip";
import { Recipe, RecipeResponse } from "@/types/recipe";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface RecipeCardsProps {
  data: RecipeResponse | null;
  isLoading: boolean;
}

export function RecipeCards({ data, isLoading }: RecipeCardsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorite_recipes");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("favorite_recipes", JSON.stringify(newFavorites));
    toast.success(favorites.includes(id) ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
  };

  const shareRecipe = async (recipe: Recipe) => {
    const text = `${recipe.nama}\n\n${recipe.deskripsi}\n\nBahan:\n${recipe.bahan.map((b) => `• ${b.jumlah} ${b.item}`).join("\n")}\n\nLangkah:\n${recipe.langkah.map((l, i) => `${i + 1}. ${l}`).join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.nama, text });
        toast.success("Berhasil dibagikan!");
      } catch {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Resep disalin ke clipboard!");
  };

  const printRecipe = (recipe: Recipe) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${recipe.nama}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>${recipe.nama}</h1>
            <p><em>${recipe.deskripsi}</em></p>
            <p><strong>Waktu:</strong> ${recipe.waktu} | <strong>Porsi:</strong> ${recipe.porsi}</p>
            <h2>Bahan:</h2>
            <ul>${recipe.bahan.map((b) => `<li>${b.jumlah} ${b.item}${b.catatan ? ` (${b.catatan})` : ""}</li>`).join("")}</ul>
            <h2>Langkah:</h2>
            <ol>${recipe.langkah.map((l) => `<li>${l}</li>`).join("")}</ol>
            ${recipe.tips ? `<h3>Tips:</h3><p>${recipe.tips}</p>` : ""}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse-soft">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <ChefHat className="h-8 w-8 text-primary animate-bounce-subtle" />
            </div>
            <p className="font-medium text-lg mb-2">AI sedang memasak ide...</p>
            <p className="text-sm text-muted-foreground">Mencari resep terbaik untuk Anda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.recipes || data.recipes.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Hasil Resep</h2>
        <HelpTooltip content="Resep dibuat oleh AI. Sesuaikan dengan selera dan bahan yang tersedia." />
        <Badge variant="secondary" className="ml-auto">
          {data.recipes.length} resep
        </Badge>
      </div>

      {data.recipes.map((recipe, index) => (
        <Card key={recipe.id || index} className="animate-slide-up overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{recipe.nama}</h3>
                  {recipe.masakan && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.masakan}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{recipe.deskripsi}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFavorite(recipe.id || String(index))}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(recipe.id || String(index))
                        ? "fill-destructive text-destructive"
                        : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => shareRecipe(recipe)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => printRecipe(recipe)}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {recipe.waktu}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {recipe.porsi}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Utensils className="h-3 w-3" />
                {recipe.tingkatKesulitan}
              </Badge>
            </div>

            {recipe.nutrisi && (
              <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 dark:text-orange-400">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold text-sm">{recipe.nutrisi.kalori}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">kkal</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-500 dark:text-red-400">
                    <Beef className="h-4 w-4" />
                    <span className="font-bold text-sm">{recipe.nutrisi.protein}g</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Protein</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400">
                    <Wheat className="h-4 w-4" />
                    <span className="font-bold text-sm">{recipe.nutrisi.karbohidrat}g</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Karbo</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500 dark:text-blue-400">
                    <Droplets className="h-4 w-4" />
                    <span className="font-bold text-sm">{recipe.nutrisi.lemak}g</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Lemak</span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🥗 Bahan-bahan
              </h4>
              <ul className="space-y-2">
                {recipe.bahan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>
                      <strong>{item.jumlah}</strong> {item.item}
                      {item.catatan && (
                        <span className="text-muted-foreground"> ({item.catatan})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                👩‍🍳 Langkah Memasak
              </h4>
              <ol className="space-y-3">
                {recipe.langkah.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                      {idx + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.tips && (
              <div className="p-4 bg-accent/20 rounded-xl border border-accent/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  💡 Tips
                </h4>
                <p className="text-sm">{recipe.tips}</p>
              </div>
            )}

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {data.tips && data.tips.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">💡 Tips Umum</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.substitusi && data.substitusi.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">🔄 Saran Pengganti Bahan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.substitusi.map((sub, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span>•</span>
                  {sub}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
