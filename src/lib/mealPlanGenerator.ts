import { MealSlot, MealTime, MealPlanPreferences, DAYS, MEAL_TIMES } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { UserProfile } from "@/types/profile";
import { REGIONAL_CUISINES } from "@/lib/profileConstants";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface GenerateMealPlanParams {
  slots: MealSlot[];
  preferences: MealPlanPreferences;
  userProfile?: UserProfile;
  apiKey: string;
  existingRecipeNames: string[];
}

const getMealTimeLabel = (mealTime: MealTime): string => {
  const labels: Record<MealTime, string> = {
    sarapan: "Sarapan",
    makan_siang: "Makan Siang", 
    makan_malam: "Makan Malam",
  };
  return labels[mealTime];
};

const buildPrompt = (
  slotsToFill: MealSlot[],
  preferences: MealPlanPreferences,
  userProfile?: UserProfile,
  existingRecipeNames: string[] = []
): string => {
  const lines: string[] = [];
  
  lines.push("Buat meal plan mingguan dengan resep unik untuk setiap slot berikut:");
  lines.push("");
  
  // List slots that need recipes
  slotsToFill.forEach((slot, idx) => {
    lines.push(`${idx + 1}. ${DAYS[slot.dayIndex]} - ${getMealTimeLabel(slot.mealTime)}`);
  });
  
  lines.push("");
  lines.push("ATURAN PENTING:");
  lines.push("1. SETIAP resep harus BERBEDA - tidak boleh ada nama resep yang sama");
  lines.push("2. Variasikan jenis masakan (Indonesia, Western, Chinese, dll)");
  lines.push("3. Variasikan protein (ayam, ikan, daging, telur, tahu/tempe)");
  lines.push("4. Sarapan: menu ringan/cepat (bubur, roti, telur, smoothie)");
  lines.push("5. Makan siang/malam: menu lengkap dengan nasi/karbohidrat");
  
  if (existingRecipeNames.length > 0) {
    lines.push("");
    lines.push(`HINDARI resep ini (sudah ada di plan): ${existingRecipeNames.join(", ")}`);
  }
  
  if (userProfile) {
    lines.push("");
    lines.push("PROFIL PENGGUNA:");
    
    if (userProfile.anggotaKeluarga.length > 0) {
      const total = 1 + userProfile.anggotaKeluarga.length;
      lines.push(`- Porsi untuk ${total} orang`);
      
      const conditions = userProfile.anggotaKeluarga.flatMap(m => m.kondisiKhusus);
      if (conditions.length > 0) {
        lines.push(`- Pertimbangkan: ${[...new Set(conditions)].join(", ")}`);
      }
      
      const hasBaby = userProfile.anggotaKeluarga.some(m => 
        m.kategoriUsia === "bayi" || m.kategoriUsia === "balita"
      );
      if (hasBaby) {
        lines.push("- Ada bayi/balita: hindari pedas berlebihan");
      }
    }
    
    if (preferences.prioritasDaerah && userProfile.provinsi) {
      const regionalKey = Object.keys(REGIONAL_CUISINES).find(key => 
        userProfile.provinsi.toLowerCase().includes(key.toLowerCase())
      );
      if (regionalKey && REGIONAL_CUISINES[regionalKey]) {
        lines.push(`- Prioritaskan masakan ${userProfile.provinsi}: ${REGIONAL_CUISINES[regionalKey].slice(0, 3).join(", ")}`);
      }
    }
    
    const skillMap = { pemula: "sederhana", menengah: "sedang", mahir: "boleh kompleks" };
    lines.push(`- Tingkat kesulitan: ${skillMap[userProfile.kemampuanMasak]}`);
    
    const budgetMap = { hemat: "bahan murah", sedang: "sedang", bebas: "bebas" };
    lines.push(`- Budget: ${budgetMap[userProfile.budgetMasak]}`);
  }
  
  return lines.join("\n");
};

const createSystemPrompt = (): string => {
  return `Kamu adalah meal planner profesional Indonesia. Buat menu mingguan yang bervariasi dan seimbang.

Format respons HARUS dalam JSON valid:
{
  "meals": [
    {
      "slot_index": 0,
      "recipe": {
        "id": "unique_id",
        "nama": "Nama Masakan",
        "deskripsi": "Deskripsi singkat 1 kalimat",
        "waktu": "30 menit",
        "porsi": "4 porsi",
        "tingkatKesulitan": "Mudah",
        "masakan": "Indonesia",
        "bahan": [
          {"item": "nama bahan", "jumlah": "takaran"}
        ],
        "langkah": ["Langkah 1", "Langkah 2"],
        "tips": "Tips singkat",
        "nutrisi": {
          "kalori": 350,
          "protein": 25,
          "karbohidrat": 30,
          "lemak": 12
        }
      }
    }
  ]
}

PENTING:
- slot_index harus sesuai urutan yang diminta (mulai dari 0)
- Setiap resep HARUS punya nama yang UNIK
- Gunakan Bahasa Indonesia
- Bahan dan langkah singkat tapi jelas
- HANYA kembalikan JSON tanpa markdown`;
};

interface MealPlanResponse {
  meals: Array<{
    slot_index: number;
    recipe: Recipe;
  }>;
}

export async function generateMealPlan({
  slots,
  preferences,
  userProfile,
  apiKey,
  existingRecipeNames,
}: GenerateMealPlanParams): Promise<MealSlot[]> {
  // Filter slots that need to be filled
  const slotsToFill = slots.filter(slot => {
    // Skip if locked (keep existing recipe)
    if (slot.isLocked) return false;
    // Skip if meal time is excluded
    if (!preferences.includeSarapan && slot.mealTime === "sarapan") return false;
    if (!preferences.includeMakanSiang && slot.mealTime === "makan_siang") return false;
    if (!preferences.includeMakanMalam && slot.mealTime === "makan_malam") return false;
    // Skip if marked as skipped
    if (slot.isSkipped) return false;
    return true;
  });

  if (slotsToFill.length === 0) {
    return slots; // Nothing to generate
  }

  const userPrompt = buildPrompt(slotsToFill, preferences, userProfile, existingRecipeNames);
  const systemPrompt = createSystemPrompt();

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
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Slightly higher for more variety
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit tercapai. Tunggu beberapa saat dan coba lagi.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("API key ditolak. Pastikan key OpenRouter benar.");
    }
    if (response.status === 402) {
      throw new Error("Kredit OpenRouter habis. Silakan top up.");
    }
    throw new Error("Gagal generate meal plan dari AI");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Tidak ada respons dari AI");
  }

  try {
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText) as MealPlanResponse;

    // Map generated recipes to slots
    const updatedSlots = [...slots];
    
    for (const meal of parsed.meals) {
      const targetSlot = slotsToFill[meal.slot_index];
      if (targetSlot) {
        const slotIndex = updatedSlots.findIndex(s => s.id === targetSlot.id);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            recipe: {
              ...meal.recipe,
              id: meal.recipe.id || crypto.randomUUID(),
            },
          };
        }
      }
    }

    return updatedSlots;
  } catch (error) {
    console.error("Parse error:", error, text);
    throw new Error("Format respons AI tidak valid");
  }
}
