import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
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

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleSubmit = async (data: { text?: string; images?: string[] }) => {
    if (!apiKey) {
      toast.error("Masukkan API Key di Pengaturan terlebih dahulu");
      setSettingsOpen(true);
      return;
    }

    if (!data.text && (!data.images || data.images.length === 0)) {
      toast.error("Masukkan bahan atau foto");
      return;
    }

    setIsLoading(true);
    setRecipeData(null);

    try {
      const result = await generateRecipes(data, apiKey, preferences);
      setRecipeData(result);
      toast.success(`${result.recipes?.length || 0} resep ditemukan`);
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

      <main className="container max-w-2xl mx-auto px-4 py-4 space-y-4">
        <HeroSection />

        <InputSection onSubmit={handleSubmit} isLoading={isLoading} />

        <PreferencesSection
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />

        <RecipeCards data={recipeData} isLoading={isLoading} />

        <InfoAccordion />

        <footer className="text-center text-xs text-muted-foreground py-4">
          <p>DapurPintar • Powered by Gemini AI</p>
        </footer>
      </main>

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
};

export default Index;
