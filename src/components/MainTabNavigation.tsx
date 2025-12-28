import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, CalendarDays } from "lucide-react";

export type MainTab = "ide-resep" | "meal-planning";

interface MainTabNavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const MainTabNavigation = ({ activeTab, onTabChange }: MainTabNavigationProps) => {
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 z-40">
      <div className="container max-w-2xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as MainTab)}>
          <TabsList className="w-full h-12 bg-transparent p-0 gap-0">
            <TabsTrigger 
              value="ide-resep" 
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Ide Resep</span>
              <span className="sm:hidden">Resep</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meal-planning"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Meal Planning</span>
              <span className="sm:hidden">Meal Plan</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
