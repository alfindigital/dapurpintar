import { Recipe } from "@/components/RecipeResult";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `Kamu adalah chef profesional Indonesia yang ahli dalam masakan rumahan. Berikan ide resep berdasarkan bahan yang diberikan user.

PENTING:
- Gunakan Bahasa Indonesia yang mudah dipahami
- Fokus pada masakan Indonesia atau yang familiar untuk ibu-ibu Indonesia
- Berikan resep yang praktis dan bisa dimasak di rumah
- Sesuaikan dengan bahan yang tersedia

Format respons HARUS dalam JSON valid dengan struktur:
{
  "nama": "Nama Masakan",
  "deskripsi": "Deskripsi singkat 1-2 kalimat",
  "waktu": "30 menit",
  "porsi": "4 porsi",
  "tingkatKesulitan": "Mudah/Sedang/Sulit",
  "bahan": ["bahan 1 dengan takaran", "bahan 2 dengan takaran"],
  "langkah": ["Langkah 1", "Langkah 2"],
  "tips": "Tips memasak (opsional)"
}

Berikan HANYA JSON tanpa markdown atau teks tambahan.`;

export async function getRecipeFromImage(base64Image: string, apiKey: string): Promise<Recipe> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + "\n\nLihat foto bahan makanan ini dan berikan ide resep yang bisa dibuat:" },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
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
    // Clean the response - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedText) as Recipe;
  } catch {
    throw new Error("Format respons AI tidak valid");
  }
}

export async function getRecipeFromText(ingredients: string, apiKey: string): Promise<Recipe> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + `\n\nBerikan ide resep dengan bahan-bahan berikut: ${ingredients}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
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
    return JSON.parse(cleanedText) as Recipe;
  } catch {
    throw new Error("Format respons AI tidak valid");
  }
}
