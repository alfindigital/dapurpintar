import { Recipe, RecipeResponse, Preferences } from "@/types/recipe";
import { UserProfile } from "@/types/profile";
import { REGIONAL_CUISINES } from "@/lib/profileConstants";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const createProfileContext = (profile?: UserProfile): string => {
  if (!profile || !profile.nama) return '';

  const lines: string[] = [];
  lines.push('\n\n--- PROFIL PENGGUNA (GUNAKAN UNTUK PERSONALISASI) ---');

  // Basic info
  lines.push(`Nama: ${profile.nama}`);
  if (profile.tanggalLahir) {
    const birth = new Date(profile.tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age > 0) lines.push(`Usia: ${age} tahun`);
  }
  lines.push(`Status: ${profile.status}`);

  // Family members
  if (profile.anggotaKeluarga.length > 0) {
    const totalPersons = 1 + profile.anggotaKeluarga.length;
    lines.push(`\nJumlah anggota keluarga: ${totalPersons} orang`);
    lines.push('Anggota keluarga:');
    for (const member of profile.anggotaKeluarga) {
      let memberLine = `- ${member.nama} (${member.hubungan}, ${member.usia} tahun, kategori: ${member.kategoriUsia})`;
      if (member.kondisiKhusus.length > 0) {
        memberLine += ` - Kondisi: ${member.kondisiKhusus.join(', ')}`;
      }
      lines.push(memberLine);
    }

    // Collect all health conditions
    const allConditions = profile.anggotaKeluarga.flatMap(m => m.kondisiKhusus);
    if (allConditions.length > 0) {
      lines.push(`\nPERTIMBANGAN KESEHATAN: ${[...new Set(allConditions)].join(', ')}`);
    }

    // Check for special age groups
    const hasBaby = profile.anggotaKeluarga.some(m => m.kategoriUsia === 'bayi' || m.kategoriUsia === 'balita');
    const hasElderly = profile.anggotaKeluarga.some(m => m.kategoriUsia === 'lansia');
    if (hasBaby) lines.push('⚠️ Ada BAYI/BALITA - pertimbangkan tekstur lembut, hindari bumbu pedas berlebihan');
    if (hasElderly) lines.push('⚠️ Ada LANSIA - pertimbangkan tekstur empuk, rendah garam, mudah dicerna');
  }

  // Location and regional preference
  if (profile.provinsi) {
    lines.push(`\nLokasi: ${profile.kota ? `${profile.kota}, ` : ''}${profile.provinsi}`);
    
    // Find regional cuisines
    const regionalKey = Object.keys(REGIONAL_CUISINES).find(key => 
      profile.provinsi.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(profile.provinsi.toLowerCase())
    );
    if (regionalKey && REGIONAL_CUISINES[regionalKey]) {
      lines.push(`Masakan daerah favorit: ${REGIONAL_CUISINES[regionalKey].join(', ')}`);
      lines.push('→ PRIORITASKAN resep masakan dari daerah ini jika relevan dengan bahan');
    }
  }

  // Cooking preferences
  const skillMap = { pemula: 'Pemula (langkah sederhana)', menengah: 'Menengah', mahir: 'Mahir (boleh kompleks)' };
  const timeMap = { singkat: '<30 menit', sedang: '30-60 menit', panjang: '>60 menit' };
  const budgetMap = { hemat: 'Hemat (bahan murah)', sedang: 'Sedang', bebas: 'Bebas' };

  lines.push(`\nKemampuan memasak: ${skillMap[profile.kemampuanMasak]}`);
  lines.push(`Waktu tersedia: ${timeMap[profile.waktuMasakTersedia]}`);
  lines.push(`Budget: ${budgetMap[profile.budgetMasak]}`);

  // Additional notes
  if (profile.catatanTambahan) {
    lines.push(`\nCatatan tambahan: ${profile.catatanTambahan}`);
  }

  lines.push('\n--- INSTRUKSI PERSONALISASI ---');
  lines.push('1. Sesuaikan PORSI resep dengan jumlah anggota keluarga');
  lines.push('2. Pertimbangkan KONDISI KESEHATAN setiap anggota');
  lines.push('3. Prioritaskan MASAKAN DAERAH jika bahan cocok');
  lines.push('4. Sesuaikan TINGKAT KESULITAN dengan kemampuan');
  lines.push('5. Perhatikan WAKTU dan BUDGET yang tersedia');
  lines.push('--- AKHIR PROFIL ---\n');

  return lines.join('\n');
};

const createSystemPrompt = (preferences: Preferences, isAutoMode: boolean, userProfile?: UserProfile) => {
  const profileContext = createProfileContext(userProfile);
  // Auto mode: AI determines everything automatically
  if (isAutoMode) {
    return `Kamu adalah chef profesional Indonesia dengan pengalaman 20+ tahun. Spesialisasimu adalah masakan rumahan yang praktis dan lezat.

MODE AUTO AKTIF - Tentukan sendiri:
- Jenis masakan yang paling cocok berdasarkan bahan yang tersedia
- Estimasi waktu memasak yang realistis
- Tingkat kesulitan yang sesuai
- Pertimbangkan bahan yang ada untuk memilih resep yang paling praktis

Tugasmu:
1. Analisis SEMUA bahan yang diberikan (teks dan/atau gambar)
2. Buat 1-3 resep unik dan praktis
3. Prioritaskan penggunaan bahan yang tersedia
4. Berikan instruksi jelas yang bisa diikuti ibu rumah tangga

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
- Berikan HANYA JSON tanpa markdown atau teks tambahan
${profileContext}`;
  }
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

  let goalText = "";
  if (preferences.mealGoal) {
    const goalMap: Record<string, string> = {
      hemat: "HEMAT - Gunakan bahan murah (tempe, tahu, telur, sayuran lokal)",
      diet: "DIET - Rendah kalori (<400 kkal), tinggi protein & serat, hindari gorengan",
      bulking: "BULKING - Tinggi protein (>30g), porsi besar, karbohidrat kompleks",
      seimbang: "SEIMBANG - Nutrisi lengkap untuk keluarga",
    };
    goalText = `\nTUJUAN MENU: ${goalMap[preferences.mealGoal]}`;
  }

  let difficultyText = "";
  if (preferences.difficulty) {
    const diffMap: Record<string, string> = {
      mudah: "MUDAH - Resep sederhana untuk pemula",
      sedang: "SEDANG - Sedikit tantangan",
      sulit: "SULIT - Resep kompleks untuk yang mahir",
    };
    difficultyText = `\nTINGKAT KESULITAN: ${diffMap[preferences.difficulty] || preferences.difficulty}`;
  }

  return `Kamu adalah chef profesional Indonesia dengan pengalaman 20+ tahun. Spesialisasimu adalah masakan rumahan yang praktis dan lezat.

Tugasmu:
1. Analisis SEMUA bahan yang diberikan (teks dan/atau gambar)
2. Buat 1-3 resep unik dan praktis
3. Prioritaskan penggunaan bahan yang tersedia
4. Berikan instruksi jelas yang bisa diikuti ibu rumah tangga
${dietaryText}${cuisineText}${timeText}${goalText}${difficultyText}

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
- Berikan HANYA JSON tanpa markdown atau teks tambahan
${profileContext}`;
};

export async function generateRecipes(
  input: { text?: string; images?: string[] },
  apiKey: string,
  preferences: Preferences,
  isAutoMode: boolean = false,
  userProfile?: UserProfile
): Promise<RecipeResponse> {
  const systemPrompt = createSystemPrompt(preferences, isAutoMode, userProfile);
  let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }> = "";

  // Build user message content
  if (input.images && input.images.length > 0) {
    // Multimodal: text + images - analyze each image separately
    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    let textPart = `Analisis setiap gambar secara terpisah dan berikan ide resep.

INSTRUKSI PENTING:
1. Identifikasi SEMUA bahan makanan di SETIAP gambar
2. Kategorikan bahan (sayuran, protein, karbohidrat, bumbu, buah, dairy, dll)
3. Sebutkan dari gambar mana bahan tersebut terdeteksi

Total ${input.images.length} gambar untuk dianalisis.`;
    
    if (input.text) {
      textPart += `\n\nBahan tambahan (teks): ${input.text}`;
    }
    contentParts.push({ type: "text", text: textPart });

    // Add each image with label
    for (let i = 0; i < input.images.length; i++) {
      contentParts.push({
        type: "text",
        text: `\n--- Gambar ${i + 1} ---`
      });
      contentParts.push({
        type: "image_url",
        image_url: { url: input.images[i] },
      });
    }
    userContent = contentParts;
  } else {
    // Text only - AI will auto-detect any format
    userContent = `Berikan ide resep dari bahan berikut (format bebas, AI akan mendeteksi bahan secara otomatis):\n\n${input.text || ""}`;
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
