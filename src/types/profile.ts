export interface FamilyMember {
  id: string;
  nama: string;
  hubungan: string;
  usia: number;
  kategoriUsia: 'bayi' | 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia';
  kondisiKhusus: string[];
}

export interface UserProfile {
  nama: string;
  usia: number;
  status: 'single' | 'menikah' | 'berkeluarga';
  anggotaKeluarga: FamilyMember[];
  provinsi: string;
  kota: string;
  kemampuanMasak: 'pemula' | 'menengah' | 'mahir';
  waktuMasakTersedia: 'singkat' | 'sedang' | 'panjang';
  budgetMasak: 'hemat' | 'sedang' | 'bebas';
  catatanTambahan: string;
  // Target nutrisi harian
  targetKalori?: number;
  targetProtein?: number;
  targetKarbohidrat?: number;
  targetLemak?: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  nama: '',
  usia: 0,
  status: 'single',
  anggotaKeluarga: [],
  provinsi: '',
  kota: '',
  kemampuanMasak: 'pemula',
  waktuMasakTersedia: 'sedang',
  budgetMasak: 'sedang',
  catatanTambahan: '',
  targetKalori: 2000,
  targetProtein: 50,
  targetKarbohidrat: 250,
  targetLemak: 65,
};

export function getKategoriUsia(usia: number): FamilyMember['kategoriUsia'] {
  if (usia < 1) return 'bayi';
  if (usia < 5) return 'balita';
  if (usia < 12) return 'anak';
  if (usia < 18) return 'remaja';
  if (usia < 60) return 'dewasa';
  return 'lansia';
}
