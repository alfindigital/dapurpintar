import { useState, useRef, useEffect } from "react";
import { Copy, ClipboardPlus } from "lucide-react";
import { Clock, ChefHat, Heart, Printer, Check } from "lucide-react";
import { ShareRecipeDropdown } from "./ShareRecipeDropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HelpTooltip } from "./HelpTooltip";
import { VoiceCookingPlayer } from "./VoiceCookingPlayer";
import { TimerSetButton, TimerDisplay, FloatingTimerSummary } from "./CookingTimerPlayer";
import { IngredientSubstitutionButton } from "./IngredientSubstitution";
import { MacroRings } from "./MacroProgressRing";
import { useVoiceCooking } from "@/hooks/useVoiceCooking";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";
import { useCookingTimer } from "@/hooks/useCookingTimer";
import { Recipe, RecipeResponse } from "@/types/recipe";
import { toast } from "sonner";

interface RecipeCardsProps {
  data: RecipeResponse | null;
  isLoading: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  isFavorite?: (recipeName: string) => boolean;
  apiKey?: string;
  onLogNutrition?: (recipe: Recipe) => void;
}

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (recipe: Recipe) => void;
  isFavorite?: (recipeName: string) => boolean;
  apiKey?: string;
  onLogNutrition?: (recipe: Recipe) => void;
}

function RecipeCard({ recipe, onToggleFavorite, isFavorite, apiKey, onLogNutrition }: RecipeCardProps) {
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [showTimerSummary, setShowTimerSummary] = useState(true);
  const [voiceCommandEnabled, setVoiceCommandEnabled] = useState(false);
  const storageKey = `checklist_${recipe.id || recipe.nama}`;
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  const allIngredientsChecked = checkedIngredients.size === recipe.bahan.length && recipe.bahan.length > 0;

  const updateCheckedIngredients = (newSet: Set<number>) => {
    setCheckedIngredients(newSet);
    if (newSet.size > 0) {
      localStorage.setItem(storageKey, JSON.stringify([...newSet]));
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  const toggleIngredient = (idx: number) => {
    const newSet = new Set(checkedIngredients);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    updateCheckedIngredients(newSet);
  };

  const voiceCooking = useVoiceCooking({
    steps: recipe.langkah,
    onStepChange: (stepIndex) => {
      setHighlightedStep(stepIndex);
      // Auto-scroll to step
      stepRefs.current[stepIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
  });

  const cookingTimer = useCookingTimer();

  const voiceCommand = useVoiceCommand({
    onNext: voiceCooking.nextStep,
    onPrev: voiceCooking.prevStep,
    onRepeat: voiceCooking.repeatStep,
    onPause: voiceCooking.pause,
    onResume: voiceCooking.resume,
    onStop: voiceCooking.stop,
    onSlower: () => voiceCooking.setRate(Math.max(0.5, voiceCooking.rate - 0.1)),
    onFaster: () => voiceCooking.setRate(Math.min(1.5, voiceCooking.rate + 0.1)),
    isSpeaking: voiceCooking.isSpeaking,
    enabled: voiceCommandEnabled,
  });

  // Reset highlight when voice stops
  useEffect(() => {
    if (!voiceCooking.isSpeaking && !voiceCooking.isPaused) {
      setHighlightedStep(null);
    }
  }, [voiceCooking.isSpeaking, voiceCooking.isPaused]);

  const formatRecipeText = () => {
    return `${recipe.nama}\n\n${recipe.deskripsi}\n\nBahan:\n${recipe.bahan.map((b) => `• ${b.jumlah} ${b.item}${b.catatan ? ` (${b.catatan})` : ""}`).join("\n")}\n\nLangkah:\n${recipe.langkah.map((l, i) => `${i + 1}. ${l}`).join("\n")}${recipe.tips ? `\n\nTips:\n${recipe.tips}` : ""}`;
  };

  const copyRecipe = () => {
    navigator.clipboard.writeText(formatRecipeText());
    toast.success("Resep disalin ke clipboard!");
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const printRecipe = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const safeNama = escapeHtml(recipe.nama);
      const safeDeskripsi = escapeHtml(recipe.deskripsi);
      const safeWaktu = escapeHtml(recipe.waktu);
      const safeBahan = recipe.bahan.map((b) => 
        `<li>${escapeHtml(b.jumlah)} ${escapeHtml(b.item)}${b.catatan ? ` (${escapeHtml(b.catatan)})` : ""}</li>`
      ).join("");
      const safeLangkah = recipe.langkah.map((l) => `<li>${escapeHtml(l)}</li>`).join("");
      const safeTips = recipe.tips ? `<h3>Tips:</h3><p>${escapeHtml(recipe.tips)}</p>` : "";
      
      printWindow.document.write(`
        <html>
          <head><title>${safeNama}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>${safeNama}</h1>
            <p><em>${safeDeskripsi}</em></p>
            <p><strong>Waktu:</strong> ${safeWaktu}</p>
            <h2>Bahan:</h2>
            <ul>${safeBahan}</ul>
            <h2>Langkah:</h2>
            <ol>${safeLangkah}</ol>
            ${safeTips}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card ref={cardRef} className="animate-slide-up overflow-hidden border-0 shadow-soft-md rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{recipe.nama}</h3>
              {recipe.masakan && (
                <Badge variant="outline" className="text-xs">
                  {recipe.masakan}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{recipe.deskripsi}</p>
          </div>
          <div className="flex gap-1">
            {recipe.nutrisi && onLogNutrition && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onLogNutrition(recipe)}
                title="Catat ke nutrisi harian"
              >
                <ClipboardPlus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite?.(recipe)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite?.(recipe.nama)
                    ? "fill-destructive text-destructive"
                    : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyRecipe}
              title="Salin resep"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <ShareRecipeDropdown recipe={recipe} cardRef={cardRef} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={printRecipe}
              title="Cetak resep"
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
        </div>

        {recipe.nutrisi && (
          <MacroRings
            kalori={recipe.nutrisi.kalori}
            protein={recipe.nutrisi.protein}
            karbohidrat={recipe.nutrisi.karbohidrat}
            lemak={recipe.nutrisi.lemak}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              Bahan-bahan
            </h4>
            <div className="flex items-center gap-2">
              {checkedIngredients.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateCheckedIngredients(new Set())}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset Semua
                </Button>
              )}
              {allIngredientsChecked && (
                <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-600">
                  <Check className="h-3 w-3" />
                  Bahan Lengkap
                </Badge>
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {recipe.bahan.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    id={`ingredient-${recipe.id}-${idx}`}
                    checked={checkedIngredients.has(idx)}
                    onCheckedChange={() => toggleIngredient(idx)}
                  />
                  <label
                    htmlFor={`ingredient-${recipe.id}-${idx}`}
                    className={`cursor-pointer transition-all ${
                      checkedIngredients.has(idx) ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    <strong>{item.jumlah}</strong> {item.item}
                    {item.catatan && (
                      <span className="text-muted-foreground"> ({item.catatan})</span>
                    )}
                  </label>
                </div>
                {apiKey && (
                  <IngredientSubstitutionButton
                    ingredient={item.item}
                    jumlah={item.jumlah}
                    recipeName={recipe.nama}
                    apiKey={apiKey}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            Langkah Memasak
          </h4>
          
          <VoiceCookingPlayer
            isSupported={voiceCooking.isSupported}
            isSpeaking={voiceCooking.isSpeaking}
            isPaused={voiceCooking.isPaused}
            currentStep={voiceCooking.currentStep}
            totalSteps={recipe.langkah.length}
            rate={voiceCooking.rate}
            onRateChange={voiceCooking.setRate}
            onPlay={voiceCooking.play}
            onPause={voiceCooking.pause}
            onResume={voiceCooking.resume}
            onStop={voiceCooking.stop}
            onNext={voiceCooking.nextStep}
            onPrev={voiceCooking.prevStep}
            onRepeat={voiceCooking.repeatStep}
            voiceCommandEnabled={voiceCommandEnabled}
            onVoiceCommandToggle={setVoiceCommandEnabled}
            isVoiceCommandSupported={voiceCommand.isSupported}
            isVoiceListening={voiceCommand.isListening}
            lastVoiceCommand={voiceCommand.lastCommand}
          />

          <ol className="space-y-3 mt-4">
            {recipe.langkah.map((step, idx) => {
              const stepTimer = cookingTimer.getTimerForStep(idx);
              return (
                <li
                  key={idx}
                  ref={(el) => (stepRefs.current[idx] = el)}
                  className={`flex gap-3 text-sm transition-all duration-300 p-2 -mx-2 rounded-lg ${
                    highlightedStep === idx
                      ? "bg-primary/10 ring-2 ring-primary/30"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span
                      className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold transition-colors ${
                        highlightedStep === idx
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <TimerSetButton
                      stepIndex={idx}
                      stepLabel={step}
                      hasTimer={!!stepTimer}
                      onSetTimer={cookingTimer.setTimer}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <span>{step}</span>
                    {stepTimer && (
                      <TimerDisplay
                        timer={stepTimer}
                        onPauseTimer={cookingTimer.pauseTimer}
                        onResumeTimer={cookingTimer.resumeTimer}
                        onRemoveTimer={cookingTimer.removeTimer}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Floating timer summary */}
          {showTimerSummary && (
            <FloatingTimerSummary
              timers={cookingTimer.timers}
              onPauseTimer={cookingTimer.pauseTimer}
              onResumeTimer={cookingTimer.resumeTimer}
              onClose={() => setShowTimerSummary(false)}
            />
          )}
        </div>

      </CardContent>
    </Card>
  );
}

interface TipsCardProps {
  tips: string;
}

function TipsCard({ tips }: TipsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium text-sm mb-3">Tips</h4>
        <p className="text-sm text-muted-foreground">{tips}</p>
      </CardContent>
    </Card>
  );
}

export function RecipeCards({ data, isLoading, onToggleFavorite, isFavorite, apiKey, onLogNutrition }: RecipeCardsProps) {
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
        <h2 className="text-lg font-semibold">Hasil Resep</h2>
        <HelpTooltip content="Resep dibuat oleh AI. Sesuaikan dengan selera dan bahan yang tersedia." />
        <Badge variant="secondary" className="ml-auto">
          {data.recipes.length} resep
        </Badge>
      </div>

      {data.recipes.map((recipe, index) => (
        <div key={recipe.id || index} className="space-y-4">
          <RecipeCard
            recipe={recipe}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite}
            apiKey={apiKey}
            onLogNutrition={onLogNutrition}
          />
          {recipe.tips && <TipsCard tips={recipe.tips} />}
        </div>
      ))}

      {data.substitusi && data.substitusi.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">Saran Pengganti Bahan</h4>
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
