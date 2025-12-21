import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-full w-5 h-5 bg-muted hover:bg-muted/80 transition-colors">
          <Info className="h-3 w-3 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
