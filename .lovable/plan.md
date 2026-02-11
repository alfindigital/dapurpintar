

# Rombak UI/UX: Modern, Minimalis & Branding Kuat

## Ringkasan
Merombak tampilan DapurPintar agar terasa lebih modern, bersih, dan punya identitas brand yang kuat. Fokus pada: tipografi yang lebih tegas, spacing yang lebih lega, warna yang lebih kohesif, dan elemen branding yang konsisten di seluruh aplikasi.

## Perubahan Utama

### 1. Color System & CSS Variables
- Palet warna baru yang lebih sophisticated: primary hijau teal yang lebih deep, background yang sedikit warm (bukan putih pure), border yang lebih halus
- Menghilangkan gradien yang tidak terpakai dari CSS
- Menambah subtle shadow system untuk depth
- Dark mode yang lebih refined dengan warna yang tidak terlalu kontras

### 2. Header - Brand Identity
- Logo lebih menonjol dengan tipografi custom: "Dapur" regular + "Pintar" bold
- Menghilangkan emoji dari tagline, ganti dengan teks elegan: "Asisten Masak Cerdas"
- Icon buttons lebih clean dengan hover states yang halus
- Background header: clean white/dark tanpa tint warna, hanya border bawah tipis

### 3. Tab Navigation
- Desain pill/segment control yang lebih modern menggantikan underline tabs
- Background rounded pada active tab
- Ukuran lebih compact dan proporsional

### 4. Input Section
- Card tanpa border, hanya shadow halus
- Tab input (Kamera/Galeri/Teks) menggunakan segment control style
- Drop zone lebih clean dengan dashed border yang lebih tipis
- Placeholder text lebih pendek dan to-the-point

### 5. Tombol CTA "Cari Ide Resep"
- Lebih tinggi (h-14) dengan rounded-full untuk kesan modern
- Subtle shadow dan hover animation
- Teks "Cari Resep" saja (lebih singkat)

### 6. Recipe Cards
- Rounded corner lebih besar (rounded-xl)
- Shadow lebih prominent tapi soft
- Header card lebih clean tanpa terlalu banyak badges
- Spacing antar elemen lebih lega

### 7. Nutrisi Tab
- Stats cards dengan desain glassmorphism ringan
- Heatmap dan chart dengan spacing yang lebih baik
- Progress bars yang lebih tipis dan elegan

### 8. Footer
- Lebih minimalis: hanya teks kecil tanpa sticky (fixed), warna sangat subtle
- Padding bottom pada konten agar tidak tertutup

### 9. Global Polish
- Font weight system: lebih banyak menggunakan font-medium daripada font-bold
- Border radius global dinaikkan ke 1rem
- Transisi hover yang lebih smooth
- Menghilangkan emoji dari section headers, ganti dengan icon Lucide yang konsisten

## Detail Teknis

### File yang diubah:
1. **`src/index.css`** - Revisi CSS variables (warna, radius, shadow)
2. **`src/components/Header.tsx`** - Redesign branding & layout
3. **`src/components/MainTabNavigation.tsx`** - Segment control style
4. **`src/components/InputSection.tsx`** - Cleaner input UI
5. **`src/components/PreferencesSection.tsx`** - Refined collapsible
6. **`src/components/RecipeCards.tsx`** - Modern card design, hapus emoji headers
7. **`src/components/NutritionOverview.tsx`** - Refined stat cards
8. **`src/components/CalorieHeatmap.tsx`** - Cleaner layout
9. **`src/pages/Index.tsx`** - Footer redesign, spacing adjustments
10. **`src/components/DailyNutritionTracker.tsx`** - Polish
11. **`tailwind.config.ts`** - Tambah custom shadow utilities

### Pendekatan:
- Perubahan incremental per-komponen, tidak menghapus fungsionalitas
- Tetap menggunakan design tokens yang sudah ada (primary, secondary, muted, dll)
- Semua perubahan backward-compatible dengan tema warna dan aksesibilitas yang sudah ada

