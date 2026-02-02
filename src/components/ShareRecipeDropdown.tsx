import { Share2, Copy, Check, Send, Image, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, RefObject } from "react";
import { Recipe } from "@/types/recipe";
import html2canvas from "html2canvas";

interface ShareRecipeDropdownProps {
  recipe: Recipe;
  className?: string;
  cardRef?: RefObject<HTMLDivElement>;
}

// SVG Icons for social platforms
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

// Format recipe for WhatsApp (with markdown-like formatting)
const formatForWhatsApp = (recipe: Recipe): string => {
  const parts = [
    `🍳 *${recipe.nama}*`,
    "",
    `📝 ${recipe.deskripsi}`,
    "",
    `⏱️ Waktu: ${recipe.waktu}`,
    recipe.porsi ? `👥 Porsi: ${recipe.porsi}` : "",
    recipe.tingkatKesulitan ? `📊 Kesulitan: ${recipe.tingkatKesulitan}` : "",
    "",
    `🥗 *Bahan-bahan:*`,
    ...recipe.bahan.map((b) => `• ${b.jumlah} ${b.item}${b.catatan ? ` (${b.catatan})` : ""}`),
    "",
    `👩‍🍳 *Langkah:*`,
    ...recipe.langkah.map((l, i) => `${i + 1}. ${l}`),
  ];

  if (recipe.tips) {
    parts.push("", `💡 *Tips:* ${recipe.tips}`);
  }

  if (recipe.nutrisi) {
    parts.push(
      "",
      `📊 *Nutrisi per porsi:*`,
      `• Kalori: ${recipe.nutrisi.kalori} kkal`,
      `• Protein: ${recipe.nutrisi.protein}g`,
      `• Karbo: ${recipe.nutrisi.karbohidrat}g`,
      `• Lemak: ${recipe.nutrisi.lemak}g`
    );
  }

  parts.push("", "---", "Dibuat dengan Dapur Pintar AI 🍳");

  return parts.filter(Boolean).join("\n");
};

// Format recipe for Twitter/X (280 char limit)
const formatForTwitter = (recipe: Recipe): string => {
  const baseText = `🍳 ${recipe.nama}\n\n${recipe.deskripsi.substring(0, 100)}${recipe.deskripsi.length > 100 ? "..." : ""}\n\n#ResepMasakan #DapurPintarAI`;
  return baseText.substring(0, 280);
};

// Format recipe for Facebook
const formatForFacebook = (recipe: Recipe): string => {
  const parts = [
    `🍳 ${recipe.nama}`,
    "",
    recipe.deskripsi,
    "",
    `⏱️ Waktu: ${recipe.waktu}`,
    "",
    `Bahan utama: ${recipe.bahan.slice(0, 5).map(b => b.item).join(", ")}${recipe.bahan.length > 5 ? "..." : ""}`,
    "",
    "Dibuat dengan Dapur Pintar AI - Asisten masak pintar berbasis AI! 👩‍🍳"
  ];
  return parts.join("\n");
};

// Format recipe for Telegram
const formatForTelegram = (recipe: Recipe): string => {
  return formatForWhatsApp(recipe); // Same format as WhatsApp
};

// Plain text format for copy
const formatPlainText = (recipe: Recipe): string => {
  const parts = [
    recipe.nama,
    "",
    recipe.deskripsi,
    "",
    `Waktu: ${recipe.waktu}`,
    recipe.porsi ? `Porsi: ${recipe.porsi}` : "",
    "",
    "Bahan-bahan:",
    ...recipe.bahan.map((b) => `• ${b.jumlah} ${b.item}${b.catatan ? ` (${b.catatan})` : ""}`),
    "",
    "Langkah-langkah:",
    ...recipe.langkah.map((l, i) => `${i + 1}. ${l}`),
  ];

  if (recipe.tips) {
    parts.push("", `Tips: ${recipe.tips}`);
  }

  return parts.filter(Boolean).join("\n");
};

export function ShareRecipeDropdown({ recipe, className, cardRef }: ShareRecipeDropdownProps) {
  const [copied, setCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async (): Promise<Blob | null> => {
    if (!cardRef?.current) {
      toast.error("Tidak dapat mengambil screenshot kartu resep");
      return null;
    }

    try {
      setIsCapturing(true);
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // Add watermark
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const padding = 20;
        const fontSize = 16;
        const watermarkText = "🍳 Dapur Pintar AI";
        
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        
        // Draw semi-transparent background for watermark
        const textMetrics = ctx.measureText(watermarkText);
        const bgWidth = textMetrics.width + 24;
        const bgHeight = fontSize + 16;
        const bgX = canvas.width - padding - bgWidth;
        const bgY = canvas.height - padding - bgHeight;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 8);
        ctx.fill();
        
        // Draw watermark text
        ctx.fillStyle = "#16a34a"; // Green color matching the brand
        ctx.fillText(
          watermarkText,
          canvas.width - padding - 12,
          canvas.height - padding - 8
        );
      }
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png", 1.0);
      });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast.error("Gagal mengambil screenshot");
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadAsImage = async () => {
    const blob = await captureScreenshot();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resep-${recipe.nama.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Gambar resep berhasil diunduh!");
  };

  const shareAsImage = async () => {
    const blob = await captureScreenshot();
    if (!blob) return;

    const file = new File([blob], `resep-${recipe.nama}.png`, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: recipe.nama,
          text: `🍳 Cek resep ${recipe.nama} ini!`,
          files: [file],
        });
        toast.success("Berhasil dibagikan!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Fallback to download if share fails
          downloadAsImage();
        }
      }
    } else {
      // Fallback to download if Web Share API doesn't support files
      downloadAsImage();
    }
  };

  const shareToWhatsApp = () => {
    const text = formatForWhatsApp(recipe);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Membuka WhatsApp...");
  };

  const shareToTwitter = () => {
    const text = formatForTwitter(recipe);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Membuka Twitter/X...");
  };

  const shareToFacebook = () => {
    const text = formatForFacebook(recipe);
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Membuka Facebook...");
  };

  const shareToTelegram = () => {
    const text = formatForTelegram(recipe);
    const url = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Membuka Telegram...");
  };

  const copyToClipboard = async () => {
    const text = formatPlainText(recipe);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Resep disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin resep");
    }
  };

  const nativeShare = async () => {
    const text = formatPlainText(recipe);
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.nama,
          text: text,
        });
        toast.success("Berhasil dibagikan!");
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${className}`}
          title="Bagikan resep"
          disabled={isCapturing}
        >
          {isCapturing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        {cardRef && (
          <>
            <DropdownMenuItem onClick={shareAsImage} className="gap-2 cursor-pointer">
              <Image className="h-4 w-4" />
              <span>Bagikan Gambar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadAsImage} className="gap-2 cursor-pointer">
              <Download className="h-4 w-4" />
              <span>Unduh Gambar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
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