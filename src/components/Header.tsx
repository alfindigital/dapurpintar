import { ChefHat, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Ide Resep AI</h1>
            <p className="text-xs text-muted-foreground">Masak apa hari ini?</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onSettingsClick} className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
