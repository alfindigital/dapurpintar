import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { InputSection } from "@/components/InputSection";
import { PreferencesSection } from "@/components/PreferencesSection";
import { RecipeCards } from "@/components/RecipeCards";
import { InfoAccordion } from "@/components/InfoAccordion";
import { SettingsDialog } from "@/components/SettingsDialog";
import { generateRecipes } from "@/lib/gemini";
import { RecipeResponse, Preferences } from "@/types/recipe";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeResponse | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: [],
    cuisine: [],
    difficulty: "mudah",
    time: "30",
  });

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleSubmit = async (data: { text?: string; images?: string[] }) => {
    if (!apiKey) {
      toast.error("Mohon masukkan dan tes API Key terlebih dahulu");
      return;
    }

    if (!data.text && (!data.images || data.images.length === 0)) {
      toast.error("Mohon masukkan bahan atau foto");
      return;
    }

    setIsLoading(true);
    setRecipeData(null);

    try {
      const result = await generateRecipes(data, apiKey, preferences);
      setRecipeData(result);
      toast.success(`Ditemukan ${result.recipes?.length || 0} resep!`);
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
        <HeroSection />

        <ApiKeyInput onApiKeyChange={handleApiKeyChange} />

        <InputSection onSubmit={handleSubmit} isLoading={isLoading} />

        <PreferencesSection
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />

        <RecipeCards data={recipeData} isLoading={isLoading} />

        <InfoAccordion />

        <footer className="text-center text-sm text-muted-foreground py-6">
          <p>Dibuat dengan ❤️ untuk ibu-ibu Indonesia</p>
          <p className="text-xs mt-1">Powered by Google Gemini AI</p>
        </footer>
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
