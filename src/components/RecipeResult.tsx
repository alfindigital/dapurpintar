import { ChefHat, Clock, Users, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "./HelpTooltip";

export interface Recipe {
  nama: string;
  deskripsi: string;
  waktu: string;
  porsi: string;
  tingkatKesulitan: string;
  bahan: string[];
  langkah: string[];
  tips?: string;
}

interface RecipeResultProps {
  recipe: Recipe | null;
  isLoading: boolean;
}

export function RecipeResult({ recipe, isLoading }: RecipeResultProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-spin">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">AI sedang mencari resep terbaik...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe) return null;

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{recipe.nama}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{recipe.deskripsi}</p>
          </div>
          <HelpTooltip content="Resep ini dibuat oleh AI berdasarkan bahan yang Anda masukkan. Sesuaikan dengan selera Anda." />
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
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">Bahan-bahan</h3>
            <HelpTooltip content="Takaran bisa disesuaikan dengan kebutuhan dan selera Anda." />
          </div>
          <ul className="space-y-2">
            {recipe.bahan.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">Langkah-langkah</h3>
            <HelpTooltip content="Ikuti langkah secara berurutan untuk hasil terbaik." />
          </div>
          <ol className="space-y-3">
            {recipe.langkah.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.tips && (
          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-accent-foreground">💡 Tips</h3>
            </div>
            <p className="text-sm text-accent-foreground/80">{recipe.tips}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
