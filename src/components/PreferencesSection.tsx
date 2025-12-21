import { HelpTooltip } from "./HelpTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DIETARY_OPTIONS, CUISINE_OPTIONS, TIME_OPTIONS } from "@/lib/constants";
import { Preferences } from "@/types/recipe";
import { cn } from "@/lib/utils";

interface PreferencesSectionProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
}

export function PreferencesSection({ preferences, onPreferencesChange }: PreferencesSectionProps) {
  const toggleDietary = (id: string) => {
    const newDietary = preferences.dietary.includes(id)
      ? preferences.dietary.filter((d) => d !== id)
      : [...preferences.dietary, id];
    onPreferencesChange({ ...preferences, dietary: newDietary });
  };

  const toggleCuisine = (id: string) => {
    const newCuisine = preferences.cuisine.includes(id)
      ? preferences.cuisine.filter((c) => c !== id)
      : [...preferences.cuisine, id];
    onPreferencesChange({ ...preferences, cuisine: newCuisine });
  };

  const setTime = (id: string) => {
    onPreferencesChange({ ...preferences, time: id });
  };

  const setDifficulty = (value: number[]) => {
    const levels = ["mudah", "sedang", "sulit"];
    onPreferencesChange({ ...preferences, difficulty: levels[value[0]] });
  };

  const getDifficultyValue = () => {
    const levels = ["mudah", "sedang", "sulit"];
    return levels.indexOf(preferences.difficulty) >= 0 ? levels.indexOf(preferences.difficulty) : 0;
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Dietary Restrictions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium">Pantangan Makanan</h3>
            <HelpTooltip content="Pilih pantangan atau preferensi diet Anda. Resep akan disesuaikan." />
          </div>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <Badge
                key={option.id}
                variant={preferences.dietary.includes(option.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  preferences.dietary.includes(option.id) && "bg-primary"
                )}
                onClick={() => toggleDietary(option.id)}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium">Jenis Masakan</h3>
            <HelpTooltip content="Pilih jenis masakan yang Anda inginkan. Bisa pilih lebih dari satu." />
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {CUISINE_OPTIONS.map((option) => (
                <Badge
                  key={option.id}
                  variant={preferences.cuisine.includes(option.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105 shrink-0",
                    preferences.cuisine.includes(option.id) && "bg-secondary"
                  )}
                  onClick={() => toggleCuisine(option.id)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Slider */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium">Tingkat Kesulitan</h3>
            <HelpTooltip content="Sesuaikan dengan kemampuan memasak Anda." />
          </div>
          <div className="px-2">
            <Slider
              value={[getDifficultyValue()]}
              onValueChange={setDifficulty}
              max={2}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mudah</span>
              <span>Sedang</span>
              <span>Sulit</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
