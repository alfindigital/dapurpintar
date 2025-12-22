import { Heart, Trash2, Clock, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FavoriteEntry } from "@/hooks/useFavorites";
import { Recipe } from "@/types/recipe";

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: FavoriteEntry[];
  onSelect: (recipe: Recipe) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function FavoritesDialog({
  open,
  onOpenChange,
  favorites,
  onSelect,
  onRemove,
  onClear,
}: FavoritesDialogProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Resep Favorit
          </DialogTitle>
          <DialogDescription>
            Resep yang Anda simpan sebagai favorit.
          </DialogDescription>
        </DialogHeader>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ChefHat className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Belum ada resep favorit</p>
            <p className="text-xs mt-1">Tekan ikon hati untuk menyimpan resep</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-2">
                {favorites.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelect(entry.recipe);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(entry.timestamp)}
                        {entry.recipe.waktu && (
                          <span className="ml-2">• {entry.recipe.waktu}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {entry.recipe.nama}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {entry.recipe.deskripsi}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(entry.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
