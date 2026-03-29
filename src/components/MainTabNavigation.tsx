import { Flame, CalendarDays, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainTab = "ide-resep" | "meal-planning" | "nutrisi";

interface MainTabNavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const tabs = [
  { value: "ide-resep" as MainTab, icon: Flame, label: "Ide Resep", shortLabel: "Resep" },
  { value: "meal-planning" as MainTab, icon: CalendarDays, label: "Meal Plan", shortLabel: "Plan" },
  { value: "nutrisi" as MainTab, icon: Activity, label: "Nutrisi", shortLabel: "Nutrisi" },
];

export const MainTabNavigation = ({ activeTab, onTabChange }: MainTabNavigationProps) => {
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 z-40">
      <div className="container max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-soft-sm scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground active:scale-[0.97]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
