import { ChefHat, Moon, Sun, Settings, History, Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface HeaderProps {
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  onFavoritesClick: () => void;
}

export function Header({ onSettingsClick, onHistoryClick, onFavoritesClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-foreground leading-tight tracking-tight">
              <span className="font-normal">Dapur</span>Pintar
            </h1>
            <span className="text-[11px] text-muted-foreground leading-none">Asisten Masak Cerdas</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded-full"
          >
            {mounted && theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavoritesClick}
            className="h-8 w-8 rounded-full"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHistoryClick}
            className="h-8 w-8 rounded-full"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-8 w-8 rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
