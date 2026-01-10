// Database makanan umum Indonesia dengan informasi nutrisi
export interface QuickFood {
  id: string;
  nama: string;
  kategori: 'sarapan' | 'lauk' | 'nasi' | 'mie' | 'snack' | 'minuman' | 'buah' | 'sayur';
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  porsi: string;
}

export const QUICK_FOODS: QuickFood[] = [
  // Sarapan
  { id: 'nasi-goreng', nama: 'Nasi Goreng', kategori: 'sarapan', kalori: 350, protein: 10, karbohidrat: 45, lemak: 15, porsi: '1 piring' },
  { id: 'bubur-ayam', nama: 'Bubur Ayam', kategori: 'sarapan', kalori: 280, protein: 12, karbohidrat: 40, lemak: 8, porsi: '1 mangkok' },
  { id: 'nasi-uduk', nama: 'Nasi Uduk', kategori: 'sarapan', kalori: 300, protein: 6, karbohidrat: 50, lemak: 10, porsi: '1 bungkus' },
  { id: 'lontong-sayur', nama: 'Lontong Sayur', kategori: 'sarapan', kalori: 320, protein: 8, karbohidrat: 42, lemak: 14, porsi: '1 porsi' },
  { id: 'roti-telur', nama: 'Roti + Telur', kategori: 'sarapan', kalori: 250, protein: 12, karbohidrat: 28, lemak: 10, porsi: '2 lembar' },
  { id: 'oatmeal', nama: 'Oatmeal', kategori: 'sarapan', kalori: 150, protein: 5, karbohidrat: 27, lemak: 3, porsi: '1 mangkok' },

  // Nasi
  { id: 'nasi-putih', nama: 'Nasi Putih', kategori: 'nasi', kalori: 200, protein: 4, karbohidrat: 44, lemak: 0.5, porsi: '1 piring' },
  { id: 'nasi-merah', nama: 'Nasi Merah', kategori: 'nasi', kalori: 180, protein: 4, karbohidrat: 38, lemak: 1, porsi: '1 piring' },
  { id: 'nasi-kuning', nama: 'Nasi Kuning', kategori: 'nasi', kalori: 220, protein: 4, karbohidrat: 42, lemak: 5, porsi: '1 piring' },

  // Lauk Protein
  { id: 'ayam-goreng', nama: 'Ayam Goreng', kategori: 'lauk', kalori: 260, protein: 25, karbohidrat: 5, lemak: 15, porsi: '1 potong' },
  { id: 'ayam-bakar', nama: 'Ayam Bakar', kategori: 'lauk', kalori: 200, protein: 26, karbohidrat: 3, lemak: 10, porsi: '1 potong' },
  { id: 'rendang', nama: 'Rendang Sapi', kategori: 'lauk', kalori: 350, protein: 28, karbohidrat: 6, lemak: 24, porsi: '100g' },
  { id: 'ikan-goreng', nama: 'Ikan Goreng', kategori: 'lauk', kalori: 180, protein: 20, karbohidrat: 2, lemak: 10, porsi: '1 ekor sedang' },
  { id: 'telur-goreng', nama: 'Telur Goreng', kategori: 'lauk', kalori: 120, protein: 7, karbohidrat: 1, lemak: 10, porsi: '1 butir' },
  { id: 'telur-rebus', nama: 'Telur Rebus', kategori: 'lauk', kalori: 80, protein: 6, karbohidrat: 0.5, lemak: 5, porsi: '1 butir' },
  { id: 'tempe-goreng', nama: 'Tempe Goreng', kategori: 'lauk', kalori: 150, protein: 10, karbohidrat: 8, lemak: 9, porsi: '3 potong' },
  { id: 'tahu-goreng', nama: 'Tahu Goreng', kategori: 'lauk', kalori: 100, protein: 6, karbohidrat: 4, lemak: 7, porsi: '2 potong' },
  { id: 'sate-ayam', nama: 'Sate Ayam', kategori: 'lauk', kalori: 220, protein: 18, karbohidrat: 8, lemak: 12, porsi: '5 tusuk' },
  { id: 'bakso', nama: 'Bakso', kategori: 'lauk', kalori: 280, protein: 14, karbohidrat: 30, lemak: 12, porsi: '1 mangkok' },

  // Mie & Pasta
  { id: 'mie-goreng', nama: 'Mie Goreng', kategori: 'mie', kalori: 400, protein: 10, karbohidrat: 55, lemak: 16, porsi: '1 piring' },
  { id: 'mie-ayam', nama: 'Mie Ayam', kategori: 'mie', kalori: 350, protein: 15, karbohidrat: 48, lemak: 12, porsi: '1 mangkok' },
  { id: 'indomie', nama: 'Indomie Goreng', kategori: 'mie', kalori: 380, protein: 8, karbohidrat: 52, lemak: 16, porsi: '1 bungkus' },
  { id: 'kwetiau', nama: 'Kwetiau Goreng', kategori: 'mie', kalori: 360, protein: 12, karbohidrat: 50, lemak: 13, porsi: '1 piring' },

  // Sayur
  { id: 'sayur-asem', nama: 'Sayur Asem', kategori: 'sayur', kalori: 60, protein: 2, karbohidrat: 12, lemak: 1, porsi: '1 mangkok' },
  { id: 'sayur-sop', nama: 'Sayur Sop', kategori: 'sayur', kalori: 80, protein: 4, karbohidrat: 10, lemak: 3, porsi: '1 mangkok' },
  { id: 'sayur-lodeh', nama: 'Sayur Lodeh', kategori: 'sayur', kalori: 120, protein: 3, karbohidrat: 12, lemak: 7, porsi: '1 mangkok' },
  { id: 'tumis-kangkung', nama: 'Tumis Kangkung', kategori: 'sayur', kalori: 70, protein: 3, karbohidrat: 6, lemak: 4, porsi: '1 porsi' },
  { id: 'capcay', nama: 'Cap Cay', kategori: 'sayur', kalori: 150, protein: 8, karbohidrat: 12, lemak: 8, porsi: '1 porsi' },
  { id: 'gado-gado', nama: 'Gado-Gado', kategori: 'sayur', kalori: 280, protein: 12, karbohidrat: 25, lemak: 16, porsi: '1 porsi' },

  // Snack
  { id: 'gorengan', nama: 'Gorengan (campur)', kategori: 'snack', kalori: 200, protein: 4, karbohidrat: 20, lemak: 12, porsi: '3 buah' },
  { id: 'pisang-goreng', nama: 'Pisang Goreng', kategori: 'snack', kalori: 150, protein: 2, karbohidrat: 25, lemak: 6, porsi: '2 buah' },
  { id: 'martabak-manis', nama: 'Martabak Manis', kategori: 'snack', kalori: 450, protein: 8, karbohidrat: 55, lemak: 22, porsi: '1 potong' },
  { id: 'risoles', nama: 'Risoles', kategori: 'snack', kalori: 180, protein: 5, karbohidrat: 18, lemak: 10, porsi: '2 buah' },
  { id: 'lemper', nama: 'Lemper Ayam', kategori: 'snack', kalori: 130, protein: 5, karbohidrat: 22, lemak: 3, porsi: '1 buah' },
  { id: 'onde-onde', nama: 'Onde-Onde', kategori: 'snack', kalori: 120, protein: 2, karbohidrat: 20, lemak: 4, porsi: '2 buah' },

  // Buah
  { id: 'pisang', nama: 'Pisang', kategori: 'buah', kalori: 90, protein: 1, karbohidrat: 23, lemak: 0.3, porsi: '1 buah' },
  { id: 'apel', nama: 'Apel', kategori: 'buah', kalori: 80, protein: 0.5, karbohidrat: 21, lemak: 0.2, porsi: '1 buah' },
  { id: 'jeruk', nama: 'Jeruk', kategori: 'buah', kalori: 60, protein: 1, karbohidrat: 15, lemak: 0.2, porsi: '1 buah' },
  { id: 'mangga', nama: 'Mangga', kategori: 'buah', kalori: 100, protein: 1, karbohidrat: 25, lemak: 0.5, porsi: '1 buah' },
  { id: 'pepaya', nama: 'Pepaya', kategori: 'buah', kalori: 60, protein: 0.5, karbohidrat: 15, lemak: 0.2, porsi: '1 potong' },
  { id: 'semangka', nama: 'Semangka', kategori: 'buah', kalori: 50, protein: 1, karbohidrat: 12, lemak: 0.2, porsi: '1 potong' },

  // Minuman
  { id: 'teh-manis', nama: 'Teh Manis', kategori: 'minuman', kalori: 80, protein: 0, karbohidrat: 20, lemak: 0, porsi: '1 gelas' },
  { id: 'kopi-susu', nama: 'Kopi Susu', kategori: 'minuman', kalori: 120, protein: 3, karbohidrat: 15, lemak: 5, porsi: '1 gelas' },
  { id: 'es-jeruk', nama: 'Es Jeruk', kategori: 'minuman', kalori: 100, protein: 0.5, karbohidrat: 25, lemak: 0, porsi: '1 gelas' },
  { id: 'susu-segar', nama: 'Susu Segar', kategori: 'minuman', kalori: 130, protein: 7, karbohidrat: 12, lemak: 7, porsi: '1 gelas' },
  { id: 'jus-alpukat', nama: 'Jus Alpukat', kategori: 'minuman', kalori: 250, protein: 4, karbohidrat: 20, lemak: 18, porsi: '1 gelas' },
  { id: 'es-campur', nama: 'Es Campur', kategori: 'minuman', kalori: 200, protein: 3, karbohidrat: 40, lemak: 4, porsi: '1 gelas' },
];

export const KATEGORI_LABELS: Record<QuickFood['kategori'], string> = {
  sarapan: 'Sarapan',
  lauk: 'Lauk Protein',
  nasi: 'Nasi',
  mie: 'Mie & Pasta',
  snack: 'Snack',
  minuman: 'Minuman',
  buah: 'Buah',
  sayur: 'Sayur',
};

export const KATEGORI_ORDER: QuickFood['kategori'][] = [
  'sarapan', 'nasi', 'lauk', 'sayur', 'mie', 'snack', 'buah', 'minuman'
];
