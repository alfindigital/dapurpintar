import { useState, useEffect } from "react";
import { Key, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HelpTooltip } from "./HelpTooltip";
import { testApiConnection } from "@/lib/openrouter";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeyChange?: (key: string) => void;
}

export function SettingsDialog({ open, onOpenChange, onApiKeyChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      const savedKey = localStorage.getItem("openrouter_api_key");
      if (savedKey) {
        setApiKey(savedKey);
        setIsValid(true);
      }
    }
  }, [open]);

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Mohon masukkan API Key");
      return;
    }

    setIsTesting(true);
    const result = await testApiConnection(apiKey.trim());
    setIsTesting(false);

    if (result.ok) {
      setIsValid(true);
      localStorage.setItem("openrouter_api_key", apiKey.trim());
      onApiKeyChange?.(apiKey.trim());
      toast.success("API Key tersimpan!");
      onOpenChange(false);
    } else {
      setIsValid(false);
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Pengaturan
          </DialogTitle>
          <DialogDescription>
            Masukkan OpenRouter API Key untuk menggunakan fitur AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="apiKey">OpenRouter API Key</Label>
              <HelpTooltip content="API Key disimpan di browser Anda. Gratis $1 credit untuk pengguna baru." />
              {isValid === true && (
                <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
              )}
            </div>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(null);
              }}
            />
          </div>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Dapatkan API Key (gratis $1 credit)
          </a>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleTestAndSave} disabled={isTesting}>
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
