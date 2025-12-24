import { useState, useRef, useEffect } from "react";
import { Clock, ChefHat, Heart, Share2, Printer, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HelpTooltip } from "./HelpTooltip";
import { VoiceCookingPlayer } from "./VoiceCookingPlayer";
import { TimerSetButton, TimerDisplay, FloatingTimerSummary } from "./CookingTimerPlayer";
import { useVoiceCooking } from "@/hooks/useVoiceCooking";
import { useCookingTimer } from "@/hooks/useCookingTimer";
import { Recipe, RecipeResponse } from "@/types/recipe";
import { toast } from "sonner";

interface RecipeCardsProps {
  data: RecipeResponse | null;
  isLoading: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  isFavorite?: (recipeName: string) => boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (recipe: Recipe) => void;
  isFavorite?: (recipeName: string) => boolean;
}

function RecipeCard({ recipe, onToggleFavorite, isFavorite }: RecipeCardProps) {
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [showTimerSummary, setShowTimerSummary] = useState(true);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

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

  // Reset highlight when voice stops
  useEffect(() => {
    if (!voiceCooking.isSpeaking && !voiceCooking.isPaused) {
      setHighlightedStep(null);
    }
  }, [voiceCooking.isSpeaking, voiceCooking.isPaused]);

  const shareRecipe = async () => {
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

  const printRecipe = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${recipe.nama}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>${recipe.nama}</h1>
            <p><em>${recipe.deskripsi}</em></p>
            <p><strong>Waktu:</strong> ${recipe.waktu}</p>
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

  return (
    <Card className="animate-slide-up overflow-hidden">
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
              onClick={shareRecipe}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={printRecipe}
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

        {recipe.tips && (
          <div className="p-4 bg-accent/20 rounded-xl border border-accent/30">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              💡 Tips
            </h4>
            <p className="text-sm">{recipe.tips}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecipeCards({ data, isLoading, onToggleFavorite, isFavorite }: RecipeCardsProps) {
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
        <RecipeCard
          key={recipe.id || index}
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      ))}

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
