import { HelpTooltip } from "./HelpTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CUISINE_OPTIONS, TIME_OPTIONS, MEAL_GOAL_OPTIONS, DIFFICULTY_OPTIONS } from "@/lib/constants";
import { Preferences, MealGoal } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Settings2, Sparkles } from "lucide-react";

interface PreferencesSectionProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  isAutoMode: boolean;
  onAutoModeChange: (isAuto: boolean) => void;
}

export function PreferencesSection({ 
  preferences, 
  onPreferencesChange,
  isAutoMode,
  onAutoModeChange 
}: PreferencesSectionProps) {
  const toggleCuisine = (id: string) => {
    const newCuisine = preferences.cuisine.includes(id)
      ? preferences.cuisine.filter((c) => c !== id)
      : [...preferences.cuisine, id];
    onPreferencesChange({ ...preferences, cuisine: newCuisine });
  };

  const setTime = (id: string) => {
    onPreferencesChange({ ...preferences, time: id });
  };

  const handleDietaryChange = (value: string) => {
    onPreferencesChange({ 
      ...preferences, 
      dietary: value.trim() ? [value] : [] 
    });
  };

  const setMealGoal = (id: string) => {
    onPreferencesChange({ ...preferences, mealGoal: id as MealGoal });
  };

  const setDifficulty = (id: string) => {
    onPreferencesChange({ ...preferences, difficulty: id });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When user opens the section, switch to manual mode
      onAutoModeChange(false);
    } else {
      // When user closes the section, switch back to auto mode
      onAutoModeChange(true);
    }
  };

  return (
    <Card className="border-0 shadow-soft-md">
      <Collapsible open={!isAutoMode} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-xl">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preferensi</span>
              <span className="text-xs text-muted-foreground">(Opsional)</span>
              <HelpTooltip content="Mode Auto: AI akan menentukan jenis masakan dan waktu memasak yang paling cocok. Klik untuk mengatur preferensi sendiri." />
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isAutoMode ? "default" : "outline"}
                className={cn(
                  "transition-all",
                  isAutoMode && "bg-primary"
                )}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isAutoMode ? "Auto" : "Manual"}
              </Badge>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                !isAutoMode && "rotate-180"
              )} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6 border-t">
            {/* Dietary Restrictions - Free Text */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Pantangan Makanan</h3>
                <HelpTooltip content="Tuliskan pantangan atau alergi makanan Anda. Contoh: alergi kacang, tidak makan daging, dll." />
              </div>
              <Input
                placeholder="Contoh: alergi udang, tidak makan daging sapi..."
                value={preferences.dietary[0] || ""}
                onChange={(e) => handleDietaryChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Cuisine Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Jenis Masakan</h3>
                <HelpTooltip content="Pilih jenis masakan yang Anda inginkan. Bisa pilih lebih dari satu." />
              </div>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((option) => (
                  <Badge
                    key={option.id}
                    variant={preferences.cuisine.includes(option.id) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      preferences.cuisine.includes(option.id) && "bg-secondary"
                    )}
                    onClick={() => toggleCuisine(option.id)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Time Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Waktu Memasak</h3>
                <HelpTooltip content="Berapa lama waktu yang Anda punya untuk memasak?" />
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((option) => (
                  <Badge
                    key={option.id}
                    variant={preferences.time === option.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      preferences.time === option.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setTime(option.id)}
                  >
                    {option.label}
                    <span className="ml-1 text-xs opacity-70">({option.desc})</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Tingkat Kesulitan</h3>
                <HelpTooltip content="Pilih tingkat kesulitan resep yang sesuai kemampuan Anda." />
              </div>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <Badge
                    key={option.id}
                    variant={preferences.difficulty === option.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      preferences.difficulty === option.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setDifficulty(option.id)}
                  >
                    {option.label}
                    <span className="ml-1 text-xs opacity-70">({option.desc})</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
