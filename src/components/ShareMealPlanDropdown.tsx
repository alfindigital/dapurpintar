import { Share2, Copy, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { MealSlot, DAYS, MEAL_TIMES } from "@/types/mealPlan";

interface ShareMealPlanDropdownProps {
  slots: MealSlot[];
  weekRange: string;
}

// SVG Icons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const formatMealPlanText = (slots: MealSlot[], weekRange: string, useMarkdown: boolean): string => {
  const b = useMarkdown ? "*" : "";
  const lines: string[] = [
    `🍽️ ${b}Meal Plan Minggu Ini${b}`,
    `📅 ${weekRange}`,
    "",
  ];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const daySlots = slots.filter(s => s.dayIndex === dayIndex && s.recipe && !s.isSkipped);
    if (daySlots.length === 0) continue;

    lines.push(`📌 ${b}${DAYS[dayIndex]}${b}`);
    for (const slot of daySlots) {
      const mealLabel = MEAL_TIMES.find(m => m.key === slot.mealTime)?.label || slot.mealTime;
      const r = slot.recipe!;
      const cal = r.nutrisi ? ` (${r.nutrisi.kalori} kkal)` : "";
      lines.push(`  • ${mealLabel}: ${r.nama}${cal}`);
    }
    lines.push("");
  }

  // Summary
  const filledSlots = slots.filter(s => s.recipe && !s.isSkipped);
  const totalKal = filledSlots.reduce((sum, s) => sum + (s.recipe?.nutrisi?.kalori || 0), 0);
  if (totalKal > 0) {
    lines.push(`📊 Total: ${filledSlots.length} menu | ~${totalKal} kkal/minggu`);
  }

  lines.push("", "---", "Dibuat dengan Dapur Pintar AI 🍳");
  return lines.join("\n");
};

const formatForTwitter = (slots: MealSlot[], weekRange: string): string => {
  const filled = slots.filter(s => s.recipe && !s.isSkipped);
  const menuNames = filled.slice(0, 4).map(s => s.recipe!.nama).join(", ");
  const more = filled.length > 4 ? ` +${filled.length - 4} lagi` : "";
  return `🍽️ Meal Plan ${weekRange}\n\n${menuNames}${more}\n\n#MealPlan #ResepMasakan #DapurPintarAI`.substring(0, 280);
};

export function ShareMealPlanDropdown({ slots, weekRange }: ShareMealPlanDropdownProps) {
  const [copied, setCopied] = useState(false);
  const hasRecipes = slots.some(s => s.recipe && !s.isSkipped);

  const shareToWhatsApp = () => {
    const text = formatMealPlanText(slots, weekRange, true);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Membuka WhatsApp...");
  };

  const shareToTelegram = () => {
    const text = formatMealPlanText(slots, weekRange, true);
    window.open(`https://t.me/share/url?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Membuka Telegram...");
  };

  const shareToTwitter = () => {
    const text = formatForTwitter(slots, weekRange);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Membuka Twitter/X...");
  };

  const shareToFacebook = () => {
    const text = formatMealPlanText(slots, weekRange, false);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, "_blank");
    toast.success("Membuka Facebook...");
  };

  const copyToClipboard = async () => {
    const text = formatMealPlanText(slots, weekRange, false);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Meal plan disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin meal plan");
    }
  };

  const nativeShare = async () => {
    const text = formatMealPlanText(slots, weekRange, false);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Meal Plan Minggu Ini", text });
        toast.success("Berhasil dibagikan!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!hasRecipes) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" title="Bagikan meal plan">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Bagikan</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2 cursor-pointer">
          <WhatsAppIcon />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTelegram} className="gap-2 cursor-pointer">
          <TelegramIcon />
          <span>Telegram</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
          <TwitterXIcon />
          <span>Twitter / X</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
          <FacebookIcon />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
        </DropdownMenuItem>
        {typeof navigator !== "undefined" && navigator.share && (
          <DropdownMenuItem onClick={nativeShare} className="gap-2 cursor-pointer">
            <Send className="h-4 w-4" />
            <span>Bagikan Lainnya...</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
