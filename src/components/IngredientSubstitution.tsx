import { useState } from "react";
import { RefreshCw, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIngredientSubstitution } from "@/hooks/useIngredientSubstitution";
import { toast } from "sonner";

interface IngredientSubstitutionButtonProps {
  ingredient: string;
  jumlah: string;
  recipeName: string;
  apiKey: string;
}

export function IngredientSubstitutionButton({
  ingredient,
  jumlah,
  recipeName,
  apiKey,
}: IngredientSubstitutionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [substitution, setSubstitution] = useState<string | null>(null);
  const { getSubstitution, isLoading } = useIngredientSubstitution(apiKey);

  const handleGetSubstitution = async () => {
    if (substitution) {
      // Already have result, just show it
      return;
    }

    try {
      const result = await getSubstitution(`${jumlah} ${ingredient}`, recipeName);
      setSubstitution(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mendapatkan substitusi";
      toast.error(message);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !substitution) {
      handleGetSubstitution();
    }
  };

  const handleRefresh = async () => {
    setSubstitution(null);
    try {
      const result = await getSubstitution(`${jumlah} ${ingredient}`, recipeName);
      setSubstitution(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mendapatkan substitusi";
      toast.error(message);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Ganti
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">🔄 Alternatif Bahan</h4>
            <div className="flex gap-1">
              {substitution && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Mencari alternatif...</span>
            </div>
          ) : substitution ? (
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {substitution}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
