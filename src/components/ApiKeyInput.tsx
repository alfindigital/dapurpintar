import { useState, useEffect } from "react";
import { Key, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "./HelpTooltip";
import { testApiConnection } from "@/lib/gemini";
import { toast } from "sonner";

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
      setIsValid(true);
    }
  }, [onApiKeyChange]);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Mohon masukkan API Key");
      return;
    }

    setIsTesting(true);
    const isConnected = await testApiConnection(apiKey.trim());
    setIsValid(isConnected);
    setIsTesting(false);

    if (isConnected) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      onApiKeyChange(apiKey.trim());
      toast.success("Koneksi berhasil! API Key tersimpan.");
    } else {
      toast.error("Koneksi gagal. Periksa API Key Anda.");
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setIsValid(null);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">API Key</h3>
          <HelpTooltip content="API Key diperlukan untuk mengakses layanan AI. Key disimpan di browser Anda dan tidak dikirim ke server kami." />
          {isValid === true && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
          {isValid === false && (
            <XCircle className="h-4 w-4 text-destructive ml-auto" />
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Input
              type="password"
              placeholder="Masukkan Gemini API Key..."
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="pr-20"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Tes Koneksi
            </Button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Dapatkan API Key gratis
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
