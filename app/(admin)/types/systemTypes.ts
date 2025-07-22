// app/(admin)/types/systemTypes.ts

// Supabase'den gelen ham profil
export type GiyotinProfil = {
  profil_resmi: string;
  profil_kodu: string;
  profil_adi: string;
  birim_agirlik: number;
};

// Hesaplanmış profil satırı (DataGrid'te gösterilen)
export type GiyotinProfilHesapli = GiyotinProfil & {
  kesim_adet: number;
  kesim_olcusu: string;
  verilecek_adet: number;
};

// Özet tablo için
export type SistemOzet = {
  id: number;
  sistem_metraj: string;
  cam_metraj: string;
  kayar_cam_adet: string;
  kayar_cam_genislik: string;
  kayar_cam_yukseklik: string;
  toplam_kg: string;
};

// Hesaplama fonksiyonları için tipler
export type SummaryCalculator = (
  form: Record<string, string>,
  rows2: GiyotinProfilHesapli[]
) => SistemOzet[];

export type MaterialCalculator = (
  form: Record<string, string>,
  profiles: GiyotinProfil[]
) => GiyotinProfilHesapli[];
