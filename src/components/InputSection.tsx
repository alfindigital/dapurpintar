import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Camera, Image, FileText, Upload, X, Mic, MicOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { HelpTooltip } from "./HelpTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface InputSectionProps {
  onSubmit: (data: { text?: string; images?: string[] }) => void;
  isLoading: boolean;
}

export function InputSection({ onSubmit, isLoading }: InputSectionProps) {
  const [images, setImages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (files: File[]) => {
    const maxImages = 10;
    const maxSize = 20 * 1024 * 1024; // 20MB total

    let totalSize = 0;
    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      totalSize += file.size;
      if (totalSize > maxSize) break;
      if (images.length + validFiles.length >= maxImages) break;
      validFiles.push(file);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitImages = () => {
    if (images.length > 0) {
      onSubmit({ images });
    }
  };

  const handleSubmitText = () => {
    const combinedText = transcript ? `${textInput} ${transcript}`.trim() : textInput.trim();
    if (combinedText) {
      onSubmit({ text: combinedText });
      resetTranscript();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold">Masukkan Bahan</h2>
          <HelpTooltip content="Pilih salah satu cara: foto langsung, pilih dari galeri, atau ketik nama bahan. AI akan menganalisis dan memberikan ide resep." />
        </div>

        <Tabs defaultValue="gallery" className="w-full">
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
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button onClick={handleSubmitImages} disabled={isLoading} className="w-full">
                  {isLoading ? "Mencari resep..." : `Cari Resep (${images.length} foto)`}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">Ambil foto bahan masakan</p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Buka Kamera
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border",
                images.length > 0 ? "py-4" : "py-8"
              )}
            >
              {images.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {images.length}/10 foto • Maks 20MB total
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium mb-1">Drag & drop foto di sini</p>
                  <p className="text-sm text-muted-foreground mb-4">atau klik tombol di bawah</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih dari Galeri
                  </Button>
                </div>
              )}
            </div>
            {images.length > 0 && (
              <Button onClick={handleSubmitImages} disabled={isLoading} className="w-full">
                {isLoading ? "Mencari resep..." : `Cari Resep (${images.length} foto)`}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Contoh: ayam, bawang merah, kecap manis, cabai, tomat..."
                  value={transcript ? `${textInput} ${transcript}`.trim() : textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                  className="resize-none pr-12"
                />
                {isSupported && (
                  <Button
                    variant={isListening ? "destructive" : "ghost"}
                    size="icon"
                    className={cn(
                      "absolute bottom-2 right-2",
                      isListening && "animate-recording"
                    )}
                    onClick={handleVoiceToggle}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Pisahkan bahan dengan koma</span>
                {isListening && (
                  <span className="text-destructive animate-pulse">● Mendengarkan...</span>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmitText}
              disabled={isLoading || (!textInput.trim() && !transcript)}
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
