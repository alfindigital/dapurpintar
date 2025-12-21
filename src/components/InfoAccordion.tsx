import { HelpCircle, Shield, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function InfoAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="how-to-use">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Cara Penggunaan
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground space-y-3">
          <ol className="list-decimal list-inside space-y-1">
            <li>Foto bahan masakan atau pilih dari galeri</li>
            <li>Atau ketik nama bahan yang Anda punya</li>
            <li>Tunggu AI menganalisis (5-10 detik)</li>
            <li>Dapatkan ide resep lengkap dengan langkah-langkah</li>
          </ol>
          <div className="pt-2">
            <p className="font-medium text-foreground mb-1">Tips hasil terbaik:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pastikan pencahayaan cukup saat foto</li>
              <li>Foto bahan secara jelas dan terpisah</li>
              <li>Gunakan latar belakang polos jika memungkinkan</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="privacy">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privasi Data
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Foto tidak disimpan di server kami</li>
            <li>API Key hanya disimpan di browser Anda</li>
            <li>Data dikirim langsung ke Google AI</li>
            <li>Tidak ada data yang dibagikan ke pihak ketiga lainnya</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="disclaimer">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Catatan Penting
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Resep dibuat oleh AI dan mungkin tidak selalu akurat</li>
            <li>Sesuaikan takaran dan bumbu dengan selera Anda</li>
            <li>Periksa alergi makanan sebelum memasak</li>
            <li>Pastikan bahan masih segar dan layak konsumsi</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
