import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function VoiceCommandInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            🎤 Perintah Suara
          </h4>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">NAVIGASI</p>
            <ul className="space-y-1 text-xs">
              <li><span className="font-medium">"Lanjut"</span> / "Next" → Langkah berikutnya</li>
              <li><span className="font-medium">"Mundur"</span> / "Kembali" → Langkah sebelumnya</li>
              <li><span className="font-medium">"Ulangi"</span> / "Ulang" → Bacakan ulang</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">KONTROL</p>
            <ul className="space-y-1 text-xs">
              <li><span className="font-medium">"Jeda"</span> / "Pause" → Hentikan sementara</li>
              <li><span className="font-medium">"Lanjutkan"</span> / "Resume" → Teruskan</li>
              <li><span className="font-medium">"Stop"</span> / "Berhenti" → Selesai</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">KECEPATAN</p>
            <ul className="space-y-1 text-xs">
              <li><span className="font-medium">"Pelan"</span> → Bicara lebih lambat</li>
              <li><span className="font-medium">"Cepat"</span> → Bicara lebih cepat</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground border-t pt-2">
            💡 Mikrofon akan pause otomatis saat suara membaca resep
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
