import { Recipe, RecipeResponse, Preferences } from "@/types/recipe";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const createSystemPrompt = (preferences: Preferences) => {
  let dietaryText = "";
  if (preferences.dietary.length > 0) {
    dietaryText = `\nPERHATIAN DIET: Resep HARUS mematuhi: ${preferences.dietary.join(", ")}`;
  }

  let cuisineText = "";
  if (preferences.cuisine.length > 0) {
    cuisineText = `\nPREFERENSI MASAKAN: Prioritaskan masakan ${preferences.cuisine.join(", ")}`;
  }

  let difficultyText = "";
  if (preferences.difficulty) {
    difficultyText = `\nTINGKAT KESULITAN: ${preferences.difficulty}`;
  }

  let timeText = "";
  if (preferences.time && preferences.time !== "unlimited") {
    timeText = `\nBATAS WAKTU: Maksimal ${preferences.time} menit`;
  }

  return `Kamu adalah chef profesional Indonesia dengan pengalaman 20+ tahun. Spesialisasimu adalah masakan rumahan yang praktis dan lezat.

Tugasmu:
1. Analisis SEMUA bahan yang diberikan (teks dan/atau gambar)
2. Buat 1-3 resep unik dan praktis
3. Prioritaskan penggunaan bahan yang tersedia
4. Berikan instruksi jelas yang bisa diikuti ibu rumah tangga
${dietaryText}${cuisineText}${difficultyText}${timeText}

Format respons HARUS dalam JSON valid dengan struktur:
{
  "recipes": [
    {
      "id": "unique_id",
      "nama": "Nama Masakan",
      "deskripsi": "Deskripsi singkat 1-2 kalimat yang menggugah selera",
      "waktu": "30 menit",
      "porsi": "4 porsi",
      "tingkatKesulitan": "Mudah|Sedang|Sulit",
      "masakan": "Indonesia/Jawa/dll",
      "bahan": [
        {"item": "nama bahan", "jumlah": "takaran", "catatan": "opsional"}
      ],
      "langkah": ["Langkah 1 dengan detail", "Langkah 2"],
      "tips": "Tips memasak yang berguna",
      "tags": ["tag1", "tag2"],
      "nutrisi": {
        "kalori": 350,
        "protein": 25,
        "karbohidrat": 30,
        "lemak": 12
      }
    }
  ],
  "tips": ["tips umum memasak 1", "tips 2"],
  "substitusi": ["saran pengganti bahan 1"]
}

PENTING:
- Gunakan Bahasa Indonesia yang mudah dipahami
- Berikan takaran yang jelas (sdm, sdt, gram, ml)
- Langkah harus detail dan mudah diikuti
- WAJIB sertakan estimasi nutrisi per porsi (kalori dalam kkal, protein/karbohidrat/lemak dalam gram)
- Berikan HANYA JSON tanpa markdown atau teks tambahan`;
};

export async function generateRecipes(
  input: { text?: string; images?: string[] },
  apiKey: string,
  preferences: Preferences
): Promise<RecipeResponse> {
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

  // Add system prompt
  const systemPrompt = createSystemPrompt(preferences);
  let userPrompt = systemPrompt + "\n\nBerikan ide resep dari bahan berikut:";

  if (input.text) {
    userPrompt += `\n\nBahan (teks): ${input.text}`;
  }

  parts.push({ text: userPrompt });

  // Add images if any
  if (input.images && input.images.length > 0) {
    for (const image of input.images) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data,
        },
      });
    }
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Gagal mendapatkan resep dari AI");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

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

export async function testApiConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, respond with just 'OK'" }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
