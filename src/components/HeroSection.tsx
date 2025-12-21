import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="text-center py-8 px-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
        <Sparkles className="h-4 w-4" />
        Powered by Google Gemini AI
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-3">
        Sulap Dapur Jadi Keajaiban
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto">
        Bingung mau masak apa? Foto bahan yang ada di dapur, dan AI kami akan
        memberikan ide resep lezat untuk Anda.
      </p>
    </section>
  );
}
