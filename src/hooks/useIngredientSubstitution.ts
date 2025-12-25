import { useState } from "react";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface UseIngredientSubstitutionReturn {
  getSubstitution: (ingredient: string, recipeName: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useIngredientSubstitution(apiKey: string): UseIngredientSubstitutionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSubstitution = async (ingredient: string, recipeName: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key tidak tersedia. Silakan atur di pengaturan.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `Kamu adalah chef Indonesia profesional yang ahli dalam substitusi bahan masakan.
              
Tugasmu: Berikan 2-3 alternatif pengganti untuk bahan yang diminta, khusus untuk konteks resep yang diberikan.

Format respons (HANYA teks biasa, TANPA markdown):
Tidak ada [nama bahan]? Coba:
• [Alternatif 1]: [penjelasan singkat kenapa cocok]
• [Alternatif 2]: [penjelasan singkat]
• [Alternatif 3 - opsional]: [penjelasan singkat]

Tips: [satu kalimat tips penggunaan]

PENTING:
- Respons dalam Bahasa Indonesia
- Singkat dan praktis (maksimal 4-5 baris)
- Fokus pada bahan yang mudah ditemukan di Indonesia
- JANGAN gunakan format markdown seperti **bold** atau # heading`
            },
            {
              role: "user",
              content: `Untuk resep "${recipeName}", berikan alternatif pengganti untuk: ${ingredient}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit. Tunggu sebentar.");
        }
        if (response.status === 402) {
          throw new Error("Kredit OpenRouter habis.");
        }
        throw new Error("Gagal mendapatkan substitusi.");
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error("Tidak ada respons dari AI");
      }

      return text.trim();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getSubstitution,
    isLoading,
    error,
  };
}
