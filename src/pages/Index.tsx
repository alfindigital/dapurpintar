import { useState } from "react";
import { Header } from "@/components/Header";
import { InputSection } from "@/components/InputSection";
import { RecipeResult, Recipe } from "@/components/RecipeResult";
import { InfoAccordion } from "@/components/InfoAccordion";
import { SettingsDialog } from "@/components/SettingsDialog";
import { getRecipeFromImage, getRecipeFromText } from "@/lib/gemini";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSubmit = async (data: { type: "image" | "text"; content: string }) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    
    if (!apiKey) {
      toast.error("Mohon masukkan API Key terlebih dahulu", {
        action: {
          label: "Pengaturan",
          onClick: () => setSettingsOpen(true),
        },
      });
      return;
    }

    setIsLoading(true);
    setRecipe(null);

    try {
      let result: Recipe;
      
      if (data.type === "image") {
        result = await getRecipeFromImage(data.content, apiKey);
      } else {
        result = await getRecipeFromText(data.content, apiKey);
      }
      
      setRecipe(result);
      toast.success("Resep berhasil ditemukan!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
        
        <RecipeResult recipe={recipe} isLoading={isLoading} />
        
        <InfoAccordion />
        
        <footer className="text-center text-xs text-muted-foreground py-4">
          <p>Dibuat dengan ❤️ untuk ibu-ibu Indonesia</p>
        </footer>
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
