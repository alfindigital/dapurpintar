import { useState, useEffect } from "react";
import { Key, ExternalLink, CheckCircle2, Loader2, Palette, RotateCcw, User, Eye, Sparkles, UserCircle, AlertTriangle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HelpTooltip } from "./HelpTooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileTab } from "./ProfileTab";
import { testApiConnection } from "@/lib/openrouter";
import { toast } from "sonner";
import { useDisplaySettings, type FontSize, type ColorTheme, type AccessibilityProfile } from "@/hooks/useDisplaySettings";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeyChange?: (key: string) => void;
}

const colorThemes: { value: ColorTheme; label: string; color: string }[] = [
  { value: "green", label: "Hijau", color: "hsl(160 84% 39%)" },
  { value: "blue", label: "Biru", color: "hsl(217 91% 50%)" },
  { value: "orange", label: "Oranye", color: "hsl(25 95% 53%)" },
  { value: "purple", label: "Ungu", color: "hsl(270 70% 55%)" },
];

const accessibilityProfiles: { value: AccessibilityProfile; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: "default", 
    label: "Default", 
    description: "Pengaturan standar",
    icon: <Sparkles className="h-5 w-5" />
  },
  { 
    value: "lansia", 
    label: "Lansia", 
    description: "Font besar, kontras tinggi, warna biru",
    icon: <User className="h-5 w-5" />
  },
  { 
    value: "low-vision", 
    label: "Low Vision", 
    description: "Font besar, kontras tinggi, warna oranye",
    icon: <Eye className="h-5 w-5" />
  },
];

export function SettingsDialog({ open, onOpenChange, onApiKeyChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const { settings, setFontSize, setHighContrast, setColorTheme, setProfile, resetToDefaults } = useDisplaySettings();
  const { profile, updateProfile, addFamilyMember, removeFamilyMember, resetProfile } = useUserProfile();

  useEffect(() => {
    if (open) {
      // Use sessionStorage for better security (clears when tab closes)
      const savedKey = sessionStorage.getItem("openrouter_api_key");
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
      // Use sessionStorage for better security (clears when tab closes)
      sessionStorage.setItem("openrouter_api_key", apiKey.trim());
      onApiKeyChange?.(apiKey.trim());
      toast.success("API Key tersimpan untuk sesi ini!");
      onOpenChange(false);
    } else {
      setIsValid(false);
      toast.error(result.message);
    }
  };

  const handleResetDefaults = () => {
    resetToDefaults();
    toast.success("Pengaturan tampilan direset ke default");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Pengaturan
          </DialogTitle>
          <DialogDescription>
            Kelola API Key dan tampilan aplikasi.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Tampilan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4 mt-4">
            {/* Security Warning */}
            <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Keamanan:</strong> API Key disimpan sementara di sesi browser ini dan akan terhapus saat tab ditutup. Jangan gunakan di komputer publik.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="apiKey">OpenRouter API Key</Label>
                <HelpTooltip content="API Key disimpan sementara di browser. Gratis $1 credit untuk pengguna baru." />
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
                autoComplete="off"
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

            <div className="flex justify-end gap-2 pt-2">
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
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <ProfileTab
              profile={profile}
              onUpdateProfile={updateProfile}
              onAddFamilyMember={addFamilyMember}
              onRemoveFamilyMember={removeFamilyMember}
              onResetProfile={resetProfile}
            />
          </TabsContent>

          <TabsContent value="display" className="space-y-6 mt-4">
            {/* Accessibility Profiles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Profil Aksesibilitas</Label>
                <HelpTooltip content="Pilih profil untuk mengatur beberapa pengaturan sekaligus" />
              </div>
              <RadioGroup
                value={settings.profile}
                onValueChange={(value) => setProfile(value as AccessibilityProfile)}
                className="grid gap-2"
              >
                {accessibilityProfiles.map((profile) => (
                  <div key={profile.value} className="flex items-center">
                    <RadioGroupItem
                      value={profile.value}
                      id={`profile-${profile.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`profile-${profile.value}`}
                      className="flex items-center gap-3 w-full cursor-pointer rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-primary">{profile.icon}</span>
                      <div className="flex-1">
                        <span className="font-medium">{profile.label}</span>
                        <p className="text-sm text-muted-foreground">{profile.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Ukuran Font</Label>
                <HelpTooltip content="Sesuaikan ukuran teks untuk kenyamanan membaca" />
              </div>
              <ToggleGroup
                type="single"
                value={settings.fontSize}
                onValueChange={(value) => value && setFontSize(value as FontSize)}
                className="justify-start"
              >
                <ToggleGroupItem value="small" aria-label="Font kecil" className="text-sm">
                  Kecil
                </ToggleGroupItem>
                <ToggleGroupItem value="normal" aria-label="Font normal">
                  Normal
                </ToggleGroupItem>
                <ToggleGroupItem value="large" aria-label="Font besar" className="text-lg">
                  Besar
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">
                Contoh teks: Resep masakan lezat untuk keluarga
              </p>
            </div>

            {/* High Contrast */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="high-contrast">Mode Kontras Tinggi</Label>
                    <HelpTooltip content="Meningkatkan kontras warna untuk kemudahan membaca, cocok untuk lansia" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Warna lebih jelas untuk penglihatan lebih baik
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
            </div>

            {/* Color Theme */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Tema Warna</Label>
                <HelpTooltip content="Pilih warna utama sesuai selera Anda" />
              </div>
              <RadioGroup
                value={settings.colorTheme}
                onValueChange={(value) => setColorTheme(value as ColorTheme)}
                className="flex flex-wrap gap-3"
              >
                {colorThemes.map((theme) => (
                  <div key={theme.value} className="flex items-center">
                    <RadioGroupItem
                      value={theme.value}
                      id={`theme-${theme.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`theme-${theme.value}`}
                      className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Reset Button */}
            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDefaults}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset ke Default
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
