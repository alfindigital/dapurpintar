import { Shield, Bot, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InfoAccordion() {
  const items = [
    {
      icon: Shield,
      label: "Data aman",
      tooltip: "Foto tidak disimpan, API key hanya di browser Anda",
    },
    {
      icon: Bot,
      label: "AI Generated",
      tooltip: "Resep dibuat AI, sesuaikan dengan selera Anda",
    },
    {
      icon: HelpCircle,
      label: "Bantuan",
      tooltip: "Foto/ketik bahan, tunggu 5-10 detik, dapatkan resep",
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {items.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
