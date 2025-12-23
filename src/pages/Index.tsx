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

  const { history, saveToHistory, removeFromHistory, clearHistory } = useRecipeHistory();
  const { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites } = useFavorites();

  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
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
      saveToHistory(result, data.text);
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
        <InputSection onSubmit={handleSubmit} isLoading={isLoading} />

        <PreferencesSection
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />

        <RecipeCards 
          data={recipeData} 
          isLoading={isLoading}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
        />

        <footer className="text-center text-xs text-muted-foreground py-4">
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
      </main>

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
