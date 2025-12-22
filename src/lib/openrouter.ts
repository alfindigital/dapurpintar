import { Recipe, RecipeResponse, Preferences } from "@/types/recipe";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const createSystemPrompt = (preferences: Preferences) => {
  let dietaryText = "";
  if (preferences.dietary.length > 0 && preferences.dietary[0]) {
    dietaryText = `\nPANTANGAN MAKANAN: Resep TIDAK BOLEH mengandung: ${preferences.dietary[0]}`;
  }

  let cuisineText = "";
  if (preferences.cuisine.length > 0) {
    const cuisineMap: Record<string, string> = {
      indonesia: "Indonesia",
      western: "Western/Barat",
      chinese: "Chinese/Tionghoa",
      "middle-eastern": "Timur Tengah",
      others: "bebas jenis masakan",
    };
    const cuisineLabels = preferences.cuisine.map((c) => cuisineMap[c] || c);
    cuisineText = `\nPREFERENSI MASAKAN: Prioritaskan masakan ${cuisineLabels.join(", ")}`;
  }

  let timeText = "";
  if (preferences.time) {
    const timeMap: Record<string, string> = {
      cepat: "kurang dari 30 menit",
      sedang: "30-60 menit",
      lama: "lebih dari 60 menit (boleh resep kompleks)",
    };
    timeText = `\nWAKTU MEMASAK: ${timeMap[preferences.time] || preferences.time}`;
  }

  return `Kamu adalah chef profesional Indonesia dengan pengalaman 20+ tahun. Spesialisasimu adalah masakan rumahan yang praktis dan lezat.

Tugasmu:
1. Analisis SEMUA bahan yang diberikan (teks dan/atau gambar)
2. Buat 1-3 resep unik dan praktis
3. Prioritaskan penggunaan bahan yang tersedia
4. Berikan instruksi jelas yang bisa diikuti ibu rumah tangga
${dietaryText}${cuisineText}${timeText}

Format respons HARUS dalam JSON valid dengan struktur:
{
  "recipes": [
    {
      "id": "unique_id",
      "nama": "Nama Masakan",
      "deskripsi": "Deskripsi singkat 1-2 kalimat yang menggugah selera",
      "waktu": "30 menit",
      "masakan": "Indonesia/Western/Chinese/dll",
      "bahan": [
        {"item": "nama bahan", "jumlah": "takaran", "catatan": "opsional"}
      ],
      "langkah": ["Langkah 1 dengan detail", "Langkah 2"],
      "tips": "Tips memasak yang berguna untuk resep ini",
      "nutrisi": {
        "kalori": 350,
        "protein": 25,
        "karbohidrat": 30,
        "lemak": 12
      }
    }
  ],
  "substitusi": ["saran pengganti bahan 1"]
}

PENTING:
- Gunakan Bahasa Indonesia yang mudah dipahami
- Berikan takaran yang jelas (sdm, sdt, gram, ml)
- Langkah harus detail dan mudah diikuti
- WAJIB sertakan estimasi nutrisi (kalori dalam kkal, protein/karbohidrat/lemak dalam gram)
- Berikan HANYA JSON tanpa markdown atau teks tambahan`;
};

export async function generateRecipes(
  input: { text?: string; images?: string[] },
  apiKey: string,
  preferences: Preferences
): Promise<RecipeResponse> {
  const systemPrompt = createSystemPrompt(preferences);
  let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }> = "";

  // Build user message content
  if (input.images && input.images.length > 0) {
    // Multimodal: text + images
    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    let textPart = "Berikan ide resep dari bahan berikut:";
    if (input.text) {
      textPart += `\n\nBahan (teks): ${input.text}`;
    }
    contentParts.push({ type: "text", text: textPart });

    for (const image of input.images) {
      contentParts.push({
        type: "image_url",
        image_url: { url: image },
      });
    }
    userContent = contentParts;
  } else {
    // Text only
    userContent = `Berikan ide resep dari bahan berikut:\n\nBahan (teks): ${input.text || ""}`;
  }

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    let message = "Gagal mendapatkan resep dari AI";
    try {
      const error = await response.json();
      message = error?.error?.message || message;
    } catch {
      // ignore
    }

    if (response.status === 429) {
      throw new Error(
        "Rate limit tercapai. Tunggu beberapa saat dan coba lagi."
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("API key ditolak. Pastikan key OpenRouter benar dan memiliki kredit.");
    }

    if (response.status === 402) {
      throw new Error("Kredit OpenRouter habis. Silakan top up di dashboard OpenRouter.");
    }

    throw new Error(message);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Tidak ada respons dari AI");
  }

  try {
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedText) as RecipeResponse;
  } catch {
    throw new Error("Format respons AI tidak valid");
  }
}

export type ApiConnectionTestResult =
  | { ok: true; message?: string }
  | {
      ok: false;
      status?: number;
      message: string;
      reason: "quota" | "auth" | "network" | "other";
    };

export async function testApiConnection(apiKey: string): Promise<ApiConnectionTestResult> {
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
        messages: [{ role: "user", content: "Hello, respond with just 'OK'" }],
        max_tokens: 10,
      }),
    });

    if (response.ok) return { ok: true };

    let apiMessage = "";
    try {
      const error = await response.json();
      apiMessage = error?.error?.message || "";
    } catch {
      // ignore
    }

    if (response.status === 429) {
      return {
        ok: false,
        status: 429,
        reason: "quota",
        message: "Rate limit tercapai. Tunggu beberapa saat dan coba lagi.",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: response.status,
        reason: "auth",
        message: "API key ditolak. Pastikan key OpenRouter benar.",
      };
    }

    if (response.status === 402) {
      return {
        ok: false,
        status: 402,
        reason: "quota",
        message: "Kredit OpenRouter habis. Silakan top up di openrouter.ai",
      };
    }

    return {
      ok: false,
      status: response.status,
      reason: "other",
      message: apiMessage || "Gagal menguji koneksi ke OpenRouter.",
    };
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Tidak bisa terhubung ke OpenRouter. Cek koneksi internet.",
    };
  }
}
