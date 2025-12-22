import { HelpTooltip } from "./HelpTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CUISINE_OPTIONS, TIME_OPTIONS } from "@/lib/constants";
import { Preferences } from "@/types/recipe";
import { cn } from "@/lib/utils";

interface PreferencesSectionProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
}

export function PreferencesSection({ preferences, onPreferencesChange }: PreferencesSectionProps) {
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
    // Store as array with single string for compatibility
    onPreferencesChange({ 
      ...preferences, 
      dietary: value.trim() ? [value] : [] 
    });
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Dietary Restrictions - Free Text */}
        <div>
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
                <span className="mr-1">{option.icon}</span>
                {option.label}
                <span className="ml-1 text-xs opacity-70">({option.desc})</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
