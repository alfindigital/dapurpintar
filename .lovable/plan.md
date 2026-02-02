
# Fitur Share Resep ke Social Media

## Ringkasan
Menambahkan fitur berbagi resep ke platform social media tertentu (WhatsApp, Facebook, Twitter/X) dengan tombol dropdown yang menampilkan opsi berbagi spesifik.

## Fitur yang Akan Ditambahkan

### 1. Komponen ShareRecipeDropdown
Dropdown menu dengan opsi berbagi ke:
- **WhatsApp** - Buka langsung ke WhatsApp dengan teks resep terformat
- **Twitter/X** - Share dengan ringkasan singkat + hashtag
- **Facebook** - Share ke timeline Facebook
- **Telegram** - Alternatif messaging populer
- **Copy Link** - Salin teks resep ke clipboard
- **Native Share** - Gunakan Web Share API (jika tersedia)

### 2. Format Konten per Platform
- **WhatsApp**: Teks lengkap dengan emoji dan format yang rapi
- **Twitter/X**: Ringkasan singkat (280 karakter) + hashtag #ResepMasakan
- **Facebook**: Deskripsi medium dengan ajakan
- **Telegram**: Format mirip WhatsApp

## Perubahan File

### File Baru
1. **src/components/ShareRecipeDropdown.tsx**
   - Komponen dropdown untuk memilih platform berbagi
   - Fungsi formatter untuk setiap platform
   - URL builder untuk deep links social media

### File yang Dimodifikasi
1. **src/components/RecipeCards.tsx**
   - Ganti tombol Share2 dengan ShareRecipeDropdown
   - Import komponen baru

2. **src/components/MealDetailSheet.tsx** (opsional)
   - Tambahkan tombol share di detail meal plan

## Detail Teknis

### URL Deep Links yang Digunakan
```text
WhatsApp:  https://wa.me/?text={encodedText}
Twitter/X: https://twitter.com/intent/tweet?text={encodedText}
Facebook:  https://www.facebook.com/sharer/sharer.php?quote={encodedText}
Telegram:  https://t.me/share/url?text={encodedText}
```

### Format Teks WhatsApp (Contoh)
```
🍳 *Nasi Goreng Spesial*

📝 Deskripsi singkat resep...

🥗 *Bahan-bahan:*
• 2 piring nasi putih
• 2 butir telur
• dst...

👩‍🍳 *Langkah:*
1. Kocok telur...
2. Panaskan minyak...

💡 Tips: ...

---
Dibuat dengan Dapur Pintar AI
```

### Komponen UI
- Menggunakan DropdownMenu dari shadcn/ui
- Icon untuk setiap platform (lucide-react + custom SVG untuk WhatsApp)
- Animasi hover dan feedback visual

## Keunggulan
- Satu tombol, banyak opsi berbagi
- Format dioptimalkan per platform
- Mendukung mobile dan desktop
- Fallback ke clipboard jika share gagal
