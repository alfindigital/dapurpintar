import { useState, useRef, ChangeEvent } from "react";
import { Camera, Image, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { HelpTooltip } from "./HelpTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InputSectionProps {
  onSubmit: (data: { type: "image" | "text"; content: string }) => void;
  isLoading: boolean;
}

export function InputSection({ onSubmit, isLoading }: InputSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitImage = () => {
    if (selectedImage) {
      onSubmit({ type: "image", content: selectedImage });
    }
  };

  const handleSubmitText = () => {
    if (textInput.trim()) {
      onSubmit({ type: "text", content: textInput.trim() });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card className="border-2 border-dashed border-border">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-medium">Masukkan Bahan Masakan</h2>
          <HelpTooltip content="Foto bahan-bahan yang ada di dapur Anda, pilih dari galeri, atau ketik nama bahan. AI akan memberikan ide resep berdasarkan bahan yang Anda miliki." />
        </div>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="camera" className="gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Kamera</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Galeri</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Teks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg bg-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Ambil foto bahan masakan Anda
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Buka Kamera
                </Button>
              </div>
            )}
            {selectedImage && (
              <Button
                onClick={handleSubmitImage}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Mencari resep..." : "Cari Ide Resep"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg bg-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Pilih foto dari galeri Anda
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Pilih dari Galeri
                </Button>
              </div>
            )}
            {selectedImage && (
              <Button
                onClick={handleSubmitImage}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Mencari resep..." : "Cari Ide Resep"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Contoh: ayam, bawang merah, kecap manis, cabai..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Pisahkan setiap bahan dengan koma
              </p>
            </div>
            <Button
              onClick={handleSubmitText}
              disabled={isLoading || !textInput.trim()}
              className="w-full"
            >
              {isLoading ? "Mencari resep..." : "Cari Ide Resep"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
