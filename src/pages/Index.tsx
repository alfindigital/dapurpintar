import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { InputSection } from "@/components/InputSection";
import { PreferencesSection } from "@/components/PreferencesSection";
import { RecipeCards } from "@/components/RecipeCards";
import { SettingsDialog } from "@/components/SettingsDialog";
import { HistoryDialog } from "@/components/HistoryDialog";
import { FavoritesDialog } from "@/components/FavoritesDialog";
import { generateRecipes } from "@/lib/openrouter";
import { RecipeResponse, Preferences, Recipe } from "@/types/recipe";
import { useRecipeHistory } from "@/hooks/useRecipeHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeResponse | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: [],
    cuisine: [],
    difficulty: "",
    time: "cepat",
  });
  const [isAutoMode, setIsAutoMode] = useState(() => {
    const saved = localStorage.getItem("preferences_auto_mode");
    return saved !== null ? saved === "true" : true;
  });
  const [inputData, setInputData] = useState<{ images: string[]; text: string }>({
    images: [],
    text: "",
  });

  const { history, saveToHistory, removeFromHistory, clearHistory } = useRecipeHistory();
  const { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites } = useFavorites();

  // Save auto mode preference
  useEffect(() => {
    localStorage.setItem("preferences_auto_mode", String(isAutoMode));
  }, [isAutoMode]);

  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleInputChange = useCallback((data: { images: string[]; text: string }) => {
    setInputData(data);
  }, []);

  // Check if user has provided any input
  const hasInput = inputData.images.length > 0 || inputData.text.trim().length > 0;

  const handleSubmit = async () => {
    if (!apiKey) {
      toast.error("Masukkan API Key di Pengaturan terlebih dahulu");
      setSettingsOpen(true);
      return;
    }

    if (!hasInput) {
      toast.error("Masukkan bahan atau foto terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setRecipeData(null);

    try {
      // Use empty preferences for Auto mode, otherwise use user preferences
      const finalPreferences: Preferences = isAutoMode
        ? { dietary: [], cuisine: [], difficulty: "", time: "" }
        : preferences;

      const submitData: { text?: string; images?: string[] } = {};
      if (inputData.images.length > 0) {
        submitData.images = inputData.images;
      }
      if (inputData.text.trim()) {
        submitData.text = inputData.text.trim();
      }

      const result = await generateRecipes(submitData, apiKey, finalPreferences, isAutoMode);
      setRecipeData(result);
      saveToHistory(result, inputData.text);
      toast.success(`${result.recipes?.length || 0} resep ditemukan`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (data: RecipeResponse) => {
    setRecipeData(data);
    toast.success("Resep dari riwayat ditampilkan");
  };

  const handleSelectFavorite = (recipe: Recipe) => {
    setRecipeData({ recipes: [recipe] });
    toast.success("Resep favorit ditampilkan");
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    if (isFavorite(recipe.nama)) {
      const fav = favorites.find((f) => f.recipe.nama === recipe.nama);
      if (fav) {
        removeFavorite(fav.id);
        toast.success("Dihapus dari favorit");
      }
    } else {
      addFavorite(recipe);
      toast.success("Ditambahkan ke favorit");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSettingsClick={() => setSettingsOpen(true)} 
        onHistoryClick={() => setHistoryOpen(true)}
        onFavoritesClick={() => setFavoritesOpen(true)}
      />

      <main className="container max-w-2xl mx-auto px-4 py-4 space-y-4">
        <InputSection onInputChange={handleInputChange} isLoading={isLoading} />

        <PreferencesSection
          preferences={preferences}
          onPreferencesChange={setPreferences}
          isAutoMode={isAutoMode}
          onAutoModeChange={setIsAutoMode}
        />

        {/* Centralized Submit Button */}
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!hasInput || isLoading}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Mencari resep...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Cari Ide Resep
              </>
            )}
          </Button>
          {!hasInput && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Masukkan bahan terlebih dahulu (foto atau teks)
            </p>
          )}
        </div>

        <RecipeCards 
          data={recipeData} 
          isLoading={isLoading}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
          apiKey={apiKey}
        />

      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 text-center text-xs text-muted-foreground z-40">
        <p>
          made by{" "}
          <a 
            href="https://alfindigital.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium hover:underline text-primary"
          >
            alfindigital
          </a>
        </p>
      </footer>

      {/* Add bottom padding to main content to account for sticky footer */}
      <div className="h-10" />

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onApiKeyChange={handleApiKeyChange}
      />

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onSelect={handleSelectHistory}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <FavoritesDialog
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        favorites={favorites}
        onSelect={handleSelectFavorite}
        onRemove={removeFavorite}
        onClear={clearFavorites}
      />
    </div>
  );
};

export default Index;
